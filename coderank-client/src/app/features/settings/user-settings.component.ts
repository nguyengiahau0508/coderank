import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  AgentApi,
  AiConfigModel,
  getModelsForProvider,
  addCustomModel,
  removeCustomModel,
  DEFAULT_AI_PROVIDER_MODELS,
} from '../../data/domains/agent/api/agent.api';
import { AiProviderEnum } from '../../data/shared/enums/enums';
import { AiUserPreferencesService } from '../../core/services/ai-user-preferences.service';

@Component({
  selector: 'app-user-settings',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsComponent implements OnInit {
  private readonly agentApi = inject(AgentApi);
  private readonly fb = inject(FormBuilder);
  private readonly aiPreferences = inject(AiUserPreferencesService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly providerConfigs = signal<AiConfigModel[]>([]);
  readonly includeContext = this.aiPreferences.includeContext;
  readonly preferredProvider = this.aiPreferences.preferredProvider;
  readonly selectedProvider = signal<AiProviderEnum>(AiProviderEnum.Gemini);
  readonly newModelName = signal('');

  readonly providers = Object.values(AiProviderEnum);
  readonly modelOptions = computed(() =>
    getModelsForProvider(this.selectedProvider()),
  );

  readonly form = this.fb.group({
    modelName: ['', Validators.required],
    apiKey: [''],
    baseHost: [''],
  });

  ngOnInit(): void {
    this.loadConfigs();
  }

  setPreferredProvider(value: string): void {
    if (!value) {
      this.aiPreferences.setPreferredProvider(null);
      return;
    }
    this.aiPreferences.setPreferredProvider(value as AiProviderEnum);
  }

  onPreferredProviderChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    this.setPreferredProvider(target?.value ?? '');
  }

  toggleContextPreference(): void {
    this.aiPreferences.setIncludeContext(!this.includeContext());
  }

  selectProvider(provider: AiProviderEnum): void {
    this.selectedProvider.set(provider);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.syncFormWithProvider(provider);
  }

  saveProviderConfig(): void {
    if (this.form.invalid) return;

    const provider = this.selectedProvider();
    const modelName = this.form.controls.modelName.value?.trim() ?? '';
    const apiKeyRaw = this.form.controls.apiKey.value?.trim() ?? '';
    const baseHostRaw = this.form.controls.baseHost.value?.trim() ?? '';

    if (!modelName) {
      this.errorMessage.set('Model không được để trống.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    const dto: {
      provider: AiProviderEnum;
      modelName: string;
      apiKey?: string;
      baseHost?: string;
    } = {
      provider,
      modelName,
    };

    if (provider === AiProviderEnum.Ollama) {
      if (baseHostRaw) {
        dto.baseHost = baseHostRaw;
      }
    } else if (apiKeyRaw) {
      dto.apiKey = apiKeyRaw;
    }

    this.agentApi.upsertConfig(dto).subscribe({
      next: (response) => {
        const saved = response.data;
        if (!saved) {
          this.saving.set(false);
          this.errorMessage.set('Lưu cấu hình thất bại, vui lòng thử lại.');
          return;
        }
        this.providerConfigs.update(list => {
          const index = list.findIndex(item => item.provider === provider);
          if (index < 0) {
            return [...list, saved];
          }
          const next = [...list];
          next[index] = saved;
          return next;
        });

        this.aiPreferences.setPreferredProvider(provider);
        this.successMessage.set(`Đã lưu cấu hình cho provider ${provider}.`);
        this.form.controls.apiKey.setValue('');
        this.loadConfigs();
        this.saving.set(false);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(error?.message || 'Không thể lưu cấu hình AI.');
      },
    });
  }

  removeProviderConfig(provider: AiProviderEnum): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.agentApi.deleteConfig(provider).subscribe({
      next: () => {
        this.providerConfigs.update(list => list.filter(item => item.provider !== provider));
        if (this.preferredProvider() === provider) {
          const next = this.providerConfigs()[0]?.provider ?? null;
          this.aiPreferences.setPreferredProvider(next);
        }
        this.successMessage.set(`Đã xóa cấu hình provider ${provider}.`);
        this.syncFormWithProvider(this.selectedProvider());
      },
      error: (error) => {
        this.errorMessage.set(error?.message || 'Không thể xóa cấu hình provider.');
      },
    });
  }

  addModel(): void {
    const name = this.newModelName().trim();
    if (!name) return;
    addCustomModel(this.selectedProvider(), name);
    this.form.controls.modelName.setValue(name);
    this.newModelName.set('');
  }

  onNewModelInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.newModelName.set(target?.value ?? '');
  }

  deleteCurrentCustomModel(): void {
    const model = this.form.controls.modelName.value?.trim();
    if (!model) return;
    if (!this.isCustomModel(this.selectedProvider(), model)) return;
    removeCustomModel(this.selectedProvider(), model);
    this.form.controls.modelName.setValue(this.modelOptions()[0] ?? '');
  }

  isConfigured(provider: AiProviderEnum): boolean {
    return this.providerConfigs().some(item => item.provider === provider);
  }

  getConfiguredModel(provider: AiProviderEnum): string {
    return this.providerConfigs().find(item => item.provider === provider)?.modelName ?? '';
  }

  isCustomModel(provider: AiProviderEnum, model: string): boolean {
    const defaults = DEFAULT_AI_PROVIDER_MODELS[provider] ?? [];
    return !defaults.includes(model);
  }

  private loadConfigs(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.agentApi.getConfigs().subscribe({
      next: (response) => {
        this.providerConfigs.set(response.data ?? []);
        const preferred = this.preferredProvider();
        if (preferred) {
          this.selectedProvider.set(preferred);
          this.syncFormWithProvider(preferred);
        } else if (this.providerConfigs().length > 0) {
          const first = this.providerConfigs()[0].provider;
          this.aiPreferences.setPreferredProvider(first);
          this.selectedProvider.set(first);
          this.syncFormWithProvider(first);
        } else {
          this.syncFormWithProvider(this.selectedProvider());
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error?.message || 'Không thể tải cấu hình AI.');
      },
    });
  }

  private syncFormWithProvider(provider: AiProviderEnum): void {
    const existing = this.providerConfigs().find(item => item.provider === provider);
    const firstModel = getModelsForProvider(provider)[0] ?? '';
    this.form.setValue({
      modelName: existing?.modelName ?? firstModel,
      apiKey: '',
      baseHost: existing?.baseHost ?? '',
    });
  }
}
