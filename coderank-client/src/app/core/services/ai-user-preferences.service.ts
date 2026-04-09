import { Injectable, signal } from '@angular/core';
import { AiProviderEnum } from '../../data/shared/enums/enums';

const INCLUDE_CONTEXT_KEY = 'ai_include_context_v1';
const PREFERRED_PROVIDER_KEY = 'ai_preferred_provider_v1';

@Injectable({ providedIn: 'root' })
export class AiUserPreferencesService {
  readonly includeContext = signal<boolean>(this.readIncludeContext());
  readonly preferredProvider = signal<AiProviderEnum | null>(this.readPreferredProvider());

  setIncludeContext(value: boolean): void {
    this.includeContext.set(value);
    localStorage.setItem(INCLUDE_CONTEXT_KEY, String(value));
  }

  setPreferredProvider(provider: AiProviderEnum | null): void {
    this.preferredProvider.set(provider);
    if (provider) {
      localStorage.setItem(PREFERRED_PROVIDER_KEY, provider);
      return;
    }
    localStorage.removeItem(PREFERRED_PROVIDER_KEY);
  }

  private readIncludeContext(): boolean {
    return localStorage.getItem(INCLUDE_CONTEXT_KEY) === 'true';
  }

  private readPreferredProvider(): AiProviderEnum | null {
    const value = localStorage.getItem(PREFERRED_PROVIDER_KEY);
    if (!value) return null;
    return Object.values(AiProviderEnum).includes(value as AiProviderEnum)
      ? (value as AiProviderEnum)
      : null;
  }
}
