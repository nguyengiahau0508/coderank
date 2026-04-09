import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Input,
  inject,
} from '@angular/core';
import hljs from 'highlight.js';

/**
 * Directive to automatically highlight code blocks within HTML content.
 * Works with content from Quill editor or any HTML containing <pre><code> blocks.
 *
 * Usage:
 * ```html
 * <div [innerHTML]="htmlContent" appHighlightCode></div>
 * ```
 *
 * The directive will find all <pre><code> elements and apply syntax highlighting.
 * It also handles inline <code> elements by detecting the language from class names.
 */
@Directive({
  selector: '[appHighlightCode]',
  standalone: true,
})
export class HighlightCodeDirective implements AfterViewInit, OnChanges {
  private readonly el = inject(ElementRef<HTMLElement>);

  @Input() appHighlightCode: unknown;

  ngAfterViewInit(): void {
    this.highlightAllCode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appHighlightCode']) {
      // Delay to ensure innerHTML has been updated
      setTimeout(() => this.highlightAllCode(), 0);
    }
  }

  private highlightAllCode(): void {
    const element = this.el.nativeElement;

    // Find all code blocks: <pre><code>, standalone <code> with language class
    const codeBlocks = element.querySelectorAll('pre code, pre.ql-syntax');

    codeBlocks.forEach((block: Element) => {
      // Skip if already highlighted
      if (block.classList.contains('hljs')) {
        return;
      }

      // Detect language from class (e.g., language-javascript, ql-syntax)
      const langClass = Array.from(block.classList).find(
        (c) => c.startsWith('language-') || c.startsWith('lang-')
      );
      const language = langClass?.replace(/^(language-|lang-)/, '');

      if (language && hljs.getLanguage(language)) {
        const result = hljs.highlight(block.textContent || '', { language });
        block.innerHTML = result.value;
      } else {
        // Auto-detect language
        const result = hljs.highlightAuto(block.textContent || '');
        block.innerHTML = result.value;
      }

      block.classList.add('hljs');
    });
  }
}
