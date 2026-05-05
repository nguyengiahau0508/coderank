import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Skeleton } from 'primeng/skeleton';
import { Button } from 'primeng/button';
import { DashboardHeroCardComponent } from './components/dashboard-hero-card.component';
import { DashboardLearningWidgetComponent } from './components/dashboard-learning-widget.component';
import { DashboardContestWidgetComponent } from './components/dashboard-contest-widget.component';
import { DashboardRecommendationsWidgetComponent } from './components/dashboard-recommendations-widget.component';
import { DashboardQuickActionsWidgetComponent } from './components/dashboard-quick-actions-widget.component';
import { StudentDashboardFacade } from './services/student-dashboard.facade';

@Component({
  selector: 'app-student-dashboard',
  imports: [
    CommonModule,
    Button,
    Skeleton,
    DashboardHeroCardComponent,
    DashboardLearningWidgetComponent,
    DashboardContestWidgetComponent,
    DashboardRecommendationsWidgetComponent,
    DashboardQuickActionsWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit {
  private readonly facade = inject(StudentDashboardFacade);
  readonly loading = this.facade.loading;
  readonly errorMessage = this.facade.errorMessage;
  readonly profile = this.facade.profile;
  readonly learning = this.facade.learning;
  readonly contests = this.facade.contests;
  readonly recommendations = this.facade.recommendations;
  readonly partialFailures = this.facade.partialFailures;

  ngOnInit(): void {
    void this.facade.loadDashboard();
  }

  reload(): void {
    void this.facade.loadDashboard();
  }
}
