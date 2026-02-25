import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProblemsApi } from '../../../../data/api/problems.api';
import { ApiResponse } from '../../../../data/interfaces';
import { ProblemsModel } from '../../../../data/models/problems.model';
import { TagsModel } from '../../../../data/models/tags.model';

/**
 * Tags Service - Operations for problem tags
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

  /**
   * Add a tag to a problem
   */
  addTag(problemId: string, tagId: string): Observable<ApiResponse<ProblemsModel>> {
    return this.problemsApi.addTag(problemId, tagId);
  }

  /**
   * Remove a tag from a problem
   */
  removeTag(problemId: string, tagId: string): Observable<ApiResponse<void>> {
    return this.problemsApi.removeTag(problemId, tagId);
  }
}
