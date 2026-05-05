import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, BaseApi } from '../../../shared';
import { StudentDashboardModel } from '../models/student-dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApi extends BaseApi {
  protected readonly endpoint = '/dashboard/student';

  getMyDashboard(): Observable<ApiResponse<StudentDashboardModel>> {
    return this.apiService.get<ApiResponse<StudentDashboardModel>>(
      this.getUrl('/me'),
    );
  }
}
