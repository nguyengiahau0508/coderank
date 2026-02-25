import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse } from '../../../../data/interfaces';
import { TagsModel } from '../../../../data/models/tags.model';

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
