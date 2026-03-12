import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data';
import { ApiResponse } from '../../../../data';
import { TagsModel } from '../../../../data';

/**
 * Student Tags Service - Read-only operations for tags
 */
@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private readonly problemsApi = inject(ProblemsApi);

  /**
   * Get all tags
   */
  getTags(): Observable<ApiResponse<TagsModel[]>> {
    return this.problemsApi.getTags();
  }
}
