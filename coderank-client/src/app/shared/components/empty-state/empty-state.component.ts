import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  imports: [Button],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <!-- Icon -->
      <div class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
        <i [class]="'text-5xl text-gray-400 ' + icon()"></i>
      </div>
      
      <!-- Title -->
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {{ title() }}
      </h3>
      
      <!-- Description -->
      <p class="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {{ description() }}
      </p>
      
      <!-- Action Button -->
      @if (actionLabel()) {
        <p-button
          [label]="actionLabel()"
          [icon]="actionIcon()"
          (onClick)="action.emit()"
          [outlined]="true"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  icon = input<string>('pi pi-inbox');
  title = input<string>('No items found');
  description = input<string>('Get started by creating your first item.');
  actionLabel = input<string>('');
  actionIcon = input<string>('pi pi-plus');
  
  action = output<void>();
}
