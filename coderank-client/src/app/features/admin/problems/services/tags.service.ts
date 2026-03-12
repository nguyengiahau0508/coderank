import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ProblemsApi, ProblemsModel, TagsModel } from '../../../../data';
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
