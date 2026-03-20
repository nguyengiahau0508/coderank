import { Directive, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { ChatContextService } from '../../core/services/chat-context.service';
import { ChatContext } from '../../core/models/chat-context.model';

/**
 * Directive to provide chat context from components.
 * 
 * Usage:
 * ```html
 * <div [appChatContext]="{ type: 'problem', problemId: '123', title: 'Two Sum', difficulty: 'easy' }">
 *   ...content...
 * </div>
 * ```
 * 
 * The context is automatically pushed when the directive initializes
 * and popped when it's destroyed (e.g., when navigating away).
 */
@Directive({
  selector: '[appChatContext]',
  standalone: true,
})
export class ChatContextDirective implements OnInit, OnDestroy {
  private readonly chatContextService = inject(ChatContextService);

  @Input('appChatContext') context: ChatContext | null = null;

  ngOnInit(): void {
    if (this.context) {
      this.chatContextService.pushContext(this.context);
    }
  }

  ngOnDestroy(): void {
    if (this.context) {
      this.chatContextService.popContext();
    }
  }
}
