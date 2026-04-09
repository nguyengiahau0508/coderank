import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ProblemsService } from '../../problems/services/problems.service';

@Component({
  selector: 'app-lectureranalytics',
  imports: [FormsModule, InputText, Toast],
  providers: [MessageService],
  template: `
    <p-toast position="top-right" />
    <div class="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Class Analytics (AI)</h1>
        <p class="text-sm text-gray-500">Nhập course ID để lấy báo cáo phân tích lớp học.</p>
      </div>

      <div class="rounded-xl border border-gray-200 p-4 bg-white flex flex-wrap gap-2 items-center">
        <input pInputText [(ngModel)]="courseId" placeholder="Course ID" class="w-full md:w-80" />
        <button
          type="button"
          class="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white disabled:opacity-50"
          (click)="generateAnalytics()"
          [disabled]="loadingGenerate()"
        >
          {{ loadingGenerate() ? 'Đang tạo...' : 'Lấy báo cáo mới' }}
        </button>
        <button
          type="button"
          class="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-700 disabled:opacity-50"
          (click)="loadLatestAnalytics()"
          [disabled]="loadingLatest()"
        >
          {{ loadingLatest() ? 'Đang tải...' : 'Lấy báo cáo gần nhất' }}
        </button>
      </div>

      @if (analytics()) {
        <div class="grid md:grid-cols-3 gap-3">
          <div class="rounded-xl border border-gray-200 p-4 bg-white">
            <p class="text-xs text-gray-500">Tổng submissions</p>
            <p class="text-2xl font-semibold text-gray-900">{{ analytics()?.totalSubmissions ?? 0 }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 p-4 bg-white">
            <p class="text-xs text-gray-500">Acceptance rate</p>
            <p class="text-2xl font-semibold text-gray-900">{{ analytics()?.acceptanceRate ?? 0 }}%</p>
          </div>
          <div class="rounded-xl border border-gray-200 p-4 bg-white">
            <p class="text-xs text-gray-500">Submission trung bình / sinh viên</p>
            <p class="text-2xl font-semibold text-gray-900">{{ analytics()?.averageSubmissionPerStudent ?? 0 }}</p>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LecturerAnalyticsComponent {
  private readonly problemsService = inject(ProblemsService);
  private readonly messageService = inject(MessageService);

  readonly loadingGenerate = signal(false);
  readonly loadingLatest = signal(false);
  readonly analytics = signal<any | null>(null);
  courseId = '';

  generateAnalytics(): void {
    if (!this.courseId.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Vui lòng nhập Course ID.' });
      return;
    }
    this.loadingGenerate.set(true);
    this.problemsService.generateCourseAnalytics(this.courseId.trim()).subscribe({
      next: (response) => {
        this.analytics.set(response.data || null);
        this.loadingGenerate.set(false);
      },
      error: () => {
        this.loadingGenerate.set(false);
      },
    });
  }

  loadLatestAnalytics(): void {
    if (!this.courseId.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Vui lòng nhập Course ID.' });
      return;
    }
    this.loadingLatest.set(true);
    this.problemsService.getLatestCourseAnalytics(this.courseId.trim()).subscribe({
      next: (response) => {
        this.analytics.set(response.data || null);
        this.loadingLatest.set(false);
      },
      error: () => {
        this.loadingLatest.set(false);
      },
    });
  }
}
