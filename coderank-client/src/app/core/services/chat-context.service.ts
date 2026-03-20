import { Injectable, signal, computed } from '@angular/core';
import { ChatContext } from '../models/chat-context.model';

/**
 * Service to manage the current chat context.
 * Components can push/pop context to indicate what the user is currently viewing.
 * The AI chat will read this context to provide better assistance.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatContextService {
  private readonly contextStack = signal<ChatContext[]>([]);

  /**
   * The current active context (top of the stack).
   * Returns null if no context is set.
   */
  readonly currentContext = computed(() => {
    const stack = this.contextStack();
    return stack.length > 0 ? stack[stack.length - 1] : null;
  });

  /**
   * Whether there is an active context.
   */
  readonly hasContext = computed(() => this.contextStack().length > 0);

  /**
   * Push a new context onto the stack.
   * Used when entering a new view (e.g., problem detail).
   */
  pushContext(context: ChatContext): void {
    this.contextStack.update((stack) => [...stack, context]);
  }

  /**
   * Pop the top context from the stack.
   * Used when leaving a view (e.g., navigating away from problem detail).
   */
  popContext(): ChatContext | undefined {
    let popped: ChatContext | undefined;
    this.contextStack.update((stack) => {
      if (stack.length === 0) return stack;
      popped = stack[stack.length - 1];
      return stack.slice(0, -1);
    });
    return popped;
  }

  /**
   * Clear all contexts from the stack.
   */
  clearAllContexts(): void {
    this.contextStack.set([]);
  }

  /**
   * Get a summary string for the current context (for display purposes).
   */
  readonly contextSummary = computed(() => {
    const ctx = this.currentContext();
    if (!ctx) return null;

    switch (ctx.type) {
      case 'problem':
        return `Problem: ${ctx.title} (${ctx.difficulty})`;
      case 'course':
        return `Course: ${ctx.title}`;
      case 'lesson':
        return `Lesson: ${ctx.title}`;
      case 'contest':
        return `Contest: ${ctx.title}`;
      case 'submission':
        return `Submission: ${ctx.problemTitle} - ${ctx.status}`;
      default:
        return (ctx as ChatContext).title;
    }
  });
}
