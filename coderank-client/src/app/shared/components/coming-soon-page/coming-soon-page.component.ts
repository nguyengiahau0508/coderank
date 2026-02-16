import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-coming-soon-page',
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <i [class]="'pi ' + icon() + ' text-white text-lg'"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">{{ title() }}</h1>
        </div>
        <p class="text-gray-500">{{ subtitle() }}</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <div class="text-center max-w-md mx-auto">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mx-auto mb-6">
            <i [class]="'pi ' + icon() + ' text-4xl text-blue-600'"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">Coming Soon</h3>
          <p class="text-gray-500 leading-relaxed">
            This page is currently under development. Check back soon for updates.
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonPageComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('pi-clock');
}
