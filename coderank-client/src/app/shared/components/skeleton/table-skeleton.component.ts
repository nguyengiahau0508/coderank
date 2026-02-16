import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-table-skeleton',
  imports: [SkeletonComponent],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex gap-4">
          <app-skeleton variant="text" width="20%" />
          <app-skeleton variant="text" width="15%" />
          <app-skeleton variant="text" width="15%" />
          <app-skeleton variant="text" width="10%" />
        </div>
      </div>
      
      <!-- Rows -->
      @for (row of [1, 2, 3, 4, 5]; track row) {
        <div class="p-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex gap-4 items-center">
            <app-skeleton variant="avatar" />
            <app-skeleton variant="text" width="25%" />
            <app-skeleton variant="text" width="15%" />
            <app-skeleton variant="text" width="10%" />
            <app-skeleton variant="button" width="80px" />
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSkeletonComponent {}
