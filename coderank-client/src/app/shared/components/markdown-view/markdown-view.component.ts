import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked, type MarkedExtension } from 'marked';
import DOMPurify from 'dompurify';

// Register custom ==highlight== extension once
const highlightExtension: MarkedExtension = {
  extensions: [
    {
      name: 'highlight',
      level: 'inline',
      start(src: string) { return src.indexOf('=='); },
      tokenizer(src: string) {
        const match = src.match(/^==([^=]+)==/);
        if (match) {
          return { type: 'highlight', raw: match[0], text: match[1] };
        }
        return undefined;
      },
      renderer(token) {
        return `<mark>${(token as any).text}</mark>`;
      },
    },
  ],
};
marked.use(highlightExtension);

/**
 * Shared component for rendering rich text content as sanitized HTML.
 * Supports both pre-rendered HTML (from Quill editor) and Markdown sources.
 *
 * Usage:
 * ```html
 * <app-markdown-view [content]="htmlString" />
 * <app-markdown-view [content]="markdownString" format="markdown" />
 * <app-markdown-view [content]="htmlString" emptyText="Chưa có nội dung" />
 * ```
 */
@Component({
  selector: 'app-markdown-view',
  template: `<div class="prose-custom" [innerHTML]="renderedHtml()"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class MarkdownViewComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Raw content string to render */
  readonly content = input<string | null | undefined>('');

  /** Content format: 'html' for pre-rendered HTML, 'markdown' for Markdown source */
  readonly format = input<'html' | 'markdown'>('html');

  /** Placeholder text shown when content is empty */
  readonly emptyText = input<string>('');

  /** Rendered and sanitized HTML */
  readonly renderedHtml = computed<SafeHtml>(() => {
    const raw = this.content();
    if (!raw?.trim()) {
      const placeholder = this.emptyText();
      if (placeholder) {
        return this.sanitizer.bypassSecurityTrustHtml(
          `<p class="text-surface-400 italic text-sm">${DOMPurify.sanitize(placeholder)}</p>`
        );
      }
      return '';
    }
    const html = this.format() === 'markdown'
      ? (marked.parse(raw) as string)
      : raw;
    const clean = DOMPurify.sanitize(html);
    return this.sanitizer.bypassSecurityTrustHtml(clean);
  });
}
