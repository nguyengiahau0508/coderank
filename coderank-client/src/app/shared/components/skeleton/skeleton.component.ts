import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  imports: [NgClass],
  template: `
    <div 
      [ngClass]="{
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded': true,
        'h-4': variant() === 'text',
        'h-8': variant() === 'title',
        'h-32': variant() === 'card',
        'h-12': variant() === 'button',
        'w-12 h-12 rounded-full': variant() === 'avatar'
      }"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  variant = input<'text' | 'title' | 'card' | 'button' | 'avatar' | 'custom'>('text');
  width = input<string>('100%');
  height = input<string | undefined>(undefined);
}
