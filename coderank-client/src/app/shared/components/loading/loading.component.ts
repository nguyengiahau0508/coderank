// Example: Loading Component
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { LoadingService } from '../../../core/services';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  imports: [ProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <p-progress-spinner
          styleClass="w-16 h-16"
          strokeWidth="4"
          animationDuration="1s"
        />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent {
  readonly loadingService = inject(LoadingService);
}
