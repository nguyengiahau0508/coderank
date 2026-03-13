import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-admin-contests',
  imports: [],
  template: `

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContestsComponent {
  readonly stats = [
    { label: 'Tổng cuộc thi', value: '—', icon: 'pi-trophy', color: 'bg-amber-500' },
    { label: 'Đang diễn ra', value: '—', icon: 'pi-play', color: 'bg-green-500' },
    { label: 'Tổng thí sinh', value: '—', icon: 'pi-users', color: 'bg-blue-500' },
  ];

  readonly contests = [
    { title: 'CodeRank Weekly #1', status: 'Đang diễn ra', date: '15/02/2026 - 22/02/2026', participants: 45, problems: 5 },
    { title: 'Thi cuối kỳ - CTDL&GT', status: 'Sắp tới', date: '01/03/2026 - 01/03/2026', participants: 0, problems: 8 },
    { title: 'Luyện tập OOP', status: 'Đã kết thúc', date: '01/02/2026 - 08/02/2026', participants: 32, problems: 4 },
  ];
}
