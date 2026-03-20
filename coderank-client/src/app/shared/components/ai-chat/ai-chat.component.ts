import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  ElementRef,
  viewChild,
  effect,
  computed,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

import {
  AgentApi,
  AiConfigModel,
  AI_PROVIDER_MODELS,
  ConversationModel,
  ConversationMessageModel,
} from '../../../data/domains/agent/api/agent.api';
import { AiProviderEnum } from '../../../data/shared/enums/enums';
import { environment } from '../../../../environments/environment';
import { ChatContextService } from '../../../core/services/chat-context.service';

/** Provider display metadata */
const PROVIDER_META: Record<AiProviderEnum, { label: string; icon: string; color: string }> = {
  [AiProviderEnum.Gemini]: { label: 'Gemini', icon: 'pi pi-sparkles', color: '#4285F4' },
  [AiProviderEnum.Groq]: { label: 'Groq', icon: 'pi pi-bolt', color: '#F55036' },
  [AiProviderEnum.Ollama]: { label: 'Ollama', icon: 'pi pi-server', color: '#7C3AED' },
};

@Component({
  selector: 'app-ai-chat',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css',
})
export class AiChatComponent {
  private readonly agentApi = inject(AgentApi);
  private readonly ngZone = inject(NgZone);
  private readonly chatContextService = inject(ChatContextService);
  private readonly messagesEl = viewChild<ElementRef<HTMLElement>>('messagesContainer');
  private readonly configPanelEl = viewChild<ElementRef<HTMLElement>>('configPanel');

  // UI state
  isOpen = signal(false);
  sidebarOpen = signal(true);
  showConfig = signal(false);
  chatSize = signal<'mini' | 'resizable' | 'maximum'>('maximum');

  // Resize state (for resizable mode)
  resizeWidth = signal(620);
  resizeHeight = signal(660);
  private isResizing = false;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartW = 0;
  private resizeStartH = 0;
  private resizeEdge: 'top' | 'left' | 'top-left' = 'top-left';
  private boundResizeMove = this.onResizeMove.bind(this);
  private boundResizeEnd = this.onResizeEnd.bind(this);

  // Conversations
  conversations = signal<ConversationModel[]>([]);
  activeConversationId = signal<string | null>(null);
  messages = signal<ConversationMessageModel[]>([]);
  editingConvId = signal<string | null>(null);
  editingConvTitle = '';

  // Streaming
  isStreaming = signal(false);
  streamingContent = signal('');
  streamingStatus = signal('');

  // Input
  inputMessage = '';

  // Provider configs
  providerConfigs = signal<AiConfigModel[]>([]);
  activeProvider = signal<AiProviderEnum | null>(null);
  isSavingConfig = signal(false);

  // Editing provider state
  editingProvider = signal<AiProviderEnum | null>(null);
  editModel = signal<string>('');
  editApiKey = signal<string>('');
  editBaseHost = signal<string>('');

  providers = Object.values(AiProviderEnum);

  activeProviderConfigured = computed(() => {
    const active = this.activeProvider();
    if (!active) return false;
    return this.providerConfigs().some(c => c.provider === active);
  });

  activeConversation = computed(() => {
    const id = this.activeConversationId();
    if (!id) return null;
    return this.conversations().find(c => c.id === id) ?? null;
  });

  // Context awareness
  readonly currentContext = this.chatContextService.currentContext;
  readonly contextSummary = this.chatContextService.contextSummary;
  readonly hasContext = this.chatContextService.hasContext;

  quickQuestions = [
    'How to solve Two Sum?',
    'Explain Big-O notation',
    'Debug my code',
    'What is dynamic programming?',
  ];

  constructor() {
    this.configureMarked();

    effect(() => {
      this.messages();
      this.isStreaming();
      this.streamingContent();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  // ---- Open / Close ----

  open() {
    this.isOpen.set(true);
    this.loadConfigs();
    this.loadConversations();
  }

  close() {
    this.isOpen.set(false);
  }

  // ---- Size Modes ----

  setSize(size: 'mini' | 'resizable' | 'maximum') {
    this.chatSize.set(size);
    if (size === 'mini') {
      this.sidebarOpen.set(false);
    }
  }

  getSizeIcon(): string {
    switch (this.chatSize()) {
      case 'mini': return 'pi pi-minus';
      case 'resizable': return 'pi pi-stop';
      case 'maximum': return 'pi pi-window-maximize';
    }
  }

  // ---- Resize Drag ----

  onResizeStart(event: MouseEvent, edge: 'top' | 'left' | 'top-left') {
    event.preventDefault();
    this.isResizing = true;
    this.resizeEdge = edge;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartW = this.resizeWidth();
    this.resizeStartH = this.resizeHeight();
    document.addEventListener('mousemove', this.boundResizeMove);
    document.addEventListener('mouseup', this.boundResizeEnd);
  }

  private onResizeMove(event: MouseEvent) {
    if (!this.isResizing) return;
    const dx = this.resizeStartX - event.clientX;
    const dy = this.resizeStartY - event.clientY;
    this.ngZone.run(() => {
      if (this.resizeEdge === 'left' || this.resizeEdge === 'top-left') {
        this.resizeWidth.set(Math.max(400, Math.min(this.resizeStartW + dx, window.innerWidth - 40)));
      }
      if (this.resizeEdge === 'top' || this.resizeEdge === 'top-left') {
        this.resizeHeight.set(Math.max(350, Math.min(this.resizeStartH + dy, window.innerHeight - 40)));
      }
    });
  }

  private onResizeEnd() {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.boundResizeMove);
    document.removeEventListener('mouseup', this.boundResizeEnd);
  }

  // ---- Conversations ----

  newChat() {
    this.activeConversationId.set(null);
    this.messages.set([]);
    this.streamingContent.set('');
    this.streamingStatus.set('');
  }

  selectConversation(id: string) {
    if (this.activeConversationId() === id) return;
    this.activeConversationId.set(id);
    this.messages.set([]);
    this.streamingContent.set('');
    this.streamingStatus.set('');

    this.agentApi.getConversation(id).subscribe({
      next: (res) => {
        const conv = res.data;
        if (conv?.messages) {
          this.messages.set(conv.messages);
        }
      },
    });
  }

  startRenaming(conv: ConversationModel, event: Event) {
    event.stopPropagation();
    this.editingConvId.set(conv.id);
    this.editingConvTitle = conv.title;
  }

  saveRename(id: string) {
    const title = this.editingConvTitle.trim();
    if (!title) {
      this.editingConvId.set(null);
      return;
    }
    this.agentApi.updateConversation(id, title).subscribe({
      next: (res) => {
        if (res.data) {
          this.conversations.update(list =>
            list.map(c => c.id === id ? { ...c, title: res.data!.title } : c),
          );
        }
        this.editingConvId.set(null);
      },
      error: () => this.editingConvId.set(null),
    });
  }

  cancelRename() {
    this.editingConvId.set(null);
  }

  deleteConversation(id: string, event: Event) {
    event.stopPropagation();
    this.agentApi.deleteConversation(id).subscribe({
      next: () => {
        this.conversations.update(list => list.filter(c => c.id !== id));
        if (this.activeConversationId() === id) {
          this.newChat();
        }
      },
    });
  }

  // ---- Messages ----

  sendQuick(question: string) {
    this.inputMessage = question;
    this.sendMessage();
  }

  onEnterKey(event: Event) {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    const text = this.inputMessage.trim();
    if (!text || this.isStreaming() || !this.activeProviderConfigured()) return;

    this.inputMessage = '';

    // Add user message to UI immediately
    const userMsg: ConversationMessageModel = {
      id: crypto.randomUUID(),
      conversationId: this.activeConversationId() || '',
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    this.messages.update(msgs => [...msgs, userMsg]);

    // Create conversation if needed
    let conversationId = this.activeConversationId();
    if (!conversationId) {
      try {
        const res = await new Promise<any>((resolve, reject) => {
          this.agentApi.createConversation().subscribe({ next: resolve, error: reject });
        });
        conversationId = res.data?.id;
        if (conversationId) {
          this.activeConversationId.set(conversationId);
          // Refresh conversation list
          this.loadConversations();
        }
      } catch {
        this.messages.update(msgs => [...msgs, {
          id: crypto.randomUUID(), conversationId: '', role: 'assistant' as const,
          content: 'Failed to create conversation. Please try again.',
          createdAt: new Date().toISOString(),
        }]);
        return;
      }
    }

    if (!conversationId) return;

    // Stream the response
    await this.streamResponse(conversationId, text);
  }

  // ---- Streaming ----

  private async streamResponse(conversationId: string, message: string) {
    this.isStreaming.set(true);
    this.streamingContent.set('');
    this.streamingStatus.set('');

    const token = localStorage.getItem('access_token');
    const url = `${environment.apiUrl}/agent/conversations/${encodeURIComponent(conversationId)}/messages`;

    // Get current context if available
    const context = this.currentContext();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          provider: this.activeProvider(),
          context: context ?? undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.substring(6));

            this.ngZone.run(() => {
              switch (data.type) {
                case 'status':
                  this.streamingStatus.set(data.content || '');
                  break;
                case 'token':
                  fullContent += data.content;
                  this.streamingContent.set(fullContent);
                  this.streamingStatus.set('');
                  break;
                case 'done':
                  this.finishStreaming(conversationId, fullContent);
                  break;
                case 'error':
                  this.finishStreaming(conversationId,
                    fullContent || 'Sorry, an error occurred. Please try again.');
                  break;
              }
            });
          } catch {}
        }
      }

      // If stream ended without 'done' event, finalize with what we have
      if (this.isStreaming()) {
        this.ngZone.run(() => {
          this.finishStreaming(conversationId, fullContent || 'Response ended unexpectedly.');
        });
      }
    } catch (err: any) {
      this.ngZone.run(() => {
        this.finishStreaming(conversationId, 'Connection error. Please try again.');
      });
    }

    // Refresh conversation list to update titles
    this.loadConversations();
  }

  private finishStreaming(conversationId: string, content: string) {
    this.messages.update(msgs => [...msgs, {
      id: crypto.randomUUID(),
      conversationId,
      role: 'assistant' as const,
      content,
      createdAt: new Date().toISOString(),
    }]);
    this.isStreaming.set(false);
    this.streamingContent.set('');
    this.streamingStatus.set('');
  }

  // ---- Textarea ----

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  // ---- Markdown ----

  renderMarkdown(content: string): string {
    const html = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(html);
  }

  onMessagesClick(event: Event) {
    const target = event.target as HTMLElement;
    const copyBtn = target.closest('.code-copy-btn') as HTMLElement | null;
    if (!copyBtn) return;
    const wrapper = copyBtn.closest('.code-block-wrapper');
    const pre = wrapper?.querySelector('pre');
    if (pre) {
      navigator.clipboard.writeText(pre.textContent || '');
      const span = copyBtn.querySelector('span');
      const icon = copyBtn.querySelector('i');
      if (span && icon) {
        span.textContent = 'Copied!';
        icon.className = 'pi pi-check';
        setTimeout(() => {
          span.textContent = 'Copy';
          icon.className = 'pi pi-copy';
        }, 2000);
      }
    }
  }

  // ---- Provider Config ----

  getProviderMeta(provider: AiProviderEnum) {
    return PROVIDER_META[provider];
  }

  getProviderModels(provider: AiProviderEnum): string[] {
    return AI_PROVIDER_MODELS[provider] || [];
  }

  isProviderConfigured(provider: AiProviderEnum): boolean {
    return this.providerConfigs().some(c => c.provider === provider);
  }

  getProviderModel(provider: AiProviderEnum): string | undefined {
    return this.providerConfigs().find(c => c.provider === provider)?.modelName;
  }

  onProviderCardClick(provider: AiProviderEnum) {
    if (this.isProviderConfigured(provider)) {
      this.activeProvider.set(provider);
    } else {
      this.openEditProvider(provider);
    }
  }

  openEditProvider(provider: AiProviderEnum, event?: Event) {
    event?.stopPropagation();
    this.editingProvider.set(provider);
    const existing = this.providerConfigs().find(c => c.provider === provider);
    const models = this.getProviderModels(provider);
    this.editModel.set(existing?.modelName || models[0] || '');
    this.editApiKey.set('');
    this.editBaseHost.set(existing?.baseHost || '');
    setTimeout(() => this.scrollConfigToBottom(), 50);
  }

  saveProviderConfig() {
    const provider = this.editingProvider();
    if (!provider) return;

    this.isSavingConfig.set(true);
    const dto = {
      provider,
      modelName: this.editModel() || undefined,
      apiKey: this.editApiKey() || undefined,
      baseHost: this.editBaseHost() || undefined,
    };

    this.agentApi.upsertConfig(dto).subscribe({
      next: (response) => {
        const saved = response.data!;
        this.providerConfigs.update(configs => {
          const idx = configs.findIndex(c => c.provider === provider);
          if (idx >= 0) {
            const updated = [...configs];
            updated[idx] = saved;
            return updated;
          }
          return [...configs, saved];
        });
        if (!this.activeProvider()) {
          this.activeProvider.set(provider);
        }
        this.editingProvider.set(null);
        this.isSavingConfig.set(false);
      },
      error: () => this.isSavingConfig.set(false),
    });
  }

  deleteProviderConfig(provider: AiProviderEnum, event?: Event) {
    event?.stopPropagation();
    this.agentApi.deleteConfig(provider).subscribe({
      next: () => {
        this.providerConfigs.update(configs => configs.filter(c => c.provider !== provider));
        if (this.activeProvider() === provider) {
          const remaining = this.providerConfigs();
          this.activeProvider.set(remaining.length > 0 ? remaining[0].provider : null);
        }
        if (this.editingProvider() === provider) {
          this.editingProvider.set(null);
        }
      },
    });
  }

  // ---- Private ----

  private loadConfigs() {
    this.agentApi.getConfigs().subscribe({
      next: (response) => {
        const configs = response.data ?? [];
        this.providerConfigs.set(configs);
        if (configs.length > 0 && !this.activeProvider()) {
          this.activeProvider.set(configs[0].provider);
        } else if (configs.length === 0) {
          this.showConfig.set(true);
        }
      },
    });
  }

  private loadConversations() {
    this.agentApi.getConversations().subscribe({
      next: (response) => {
        this.conversations.set(response.data ?? []);
      },
    });
  }

  private scrollToBottom() {
    const el = this.messagesEl()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  private scrollConfigToBottom() {
    const el = this.configPanelEl()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  private configureMarked() {
    marked.use({
      renderer: {
        code({ text, lang }) {
          const language = lang || '';
          const displayLang = language || 'code';
          let highlighted: string;
          if (language && hljs.getLanguage(language)) {
            highlighted = hljs.highlight(text, { language }).value;
          } else {
            highlighted = hljs.highlightAuto(text).value;
          }
          return `<div class="code-block-wrapper"><div class="code-block-header"><span class="code-lang">${displayLang}</span><button class="code-copy-btn" type="button"><i class="pi pi-copy"></i><span>Copy</span></button></div><pre><code class="hljs">${highlighted}</code></pre></div>`;
        },
      },
    });
  }
}
