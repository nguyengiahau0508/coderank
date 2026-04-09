import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ProblemsApi, ProgrammingLanguageEnum } from '../../../../data';

export interface AiHintItem {
  id: string;
  level: 'approach' | 'algorithm' | 'pseudocode' | 'partial_code';
  content: string;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class AiAssistantService {
  private readonly problemsApi = inject(ProblemsApi);

  getAiHints(problemId: string, lang: 'vi' | 'en' = 'vi'): Observable<ApiResponse<AiHintItem[]>> {
    return this.problemsApi.getAiHints(problemId, lang);
  }

  getAlgorithmSuggestion(
    problemId: string,
    body: { code?: string; language?: ProgrammingLanguageEnum; lang?: 'vi' | 'en' } = {},
  ): Observable<ApiResponse<any>> {
    return this.problemsApi.getAlgorithmSuggestion(problemId, body as any);
  }

  getCodeReview(submissionId: string): Observable<ApiResponse<any>> {
    return this.problemsApi.getAiCodeReview(submissionId);
  }

  getErrorExplanation(submissionId: string, lang: 'vi' | 'en' = 'vi'): Observable<ApiResponse<any>> {
    return this.problemsApi.getAiErrorExplanation(submissionId, lang);
  }

  getDebugAssist(submissionId: string, lang: 'vi' | 'en' = 'vi'): Observable<ApiResponse<any>> {
    return this.problemsApi.getAiDebugAssist(submissionId, lang);
  }

  getSolutionExplanation(
    submissionId: string,
    lang: 'vi' | 'en' = 'vi',
    detail: 'brief' | 'detailed' = 'detailed',
  ): Observable<ApiResponse<any>> {
    return this.problemsApi.getAiExplainSolution(submissionId, lang, detail);
  }

  getOptimizationSuggestions(
    submissionId: string,
    lang: 'vi' | 'en' = 'vi',
  ): Observable<ApiResponse<any>> {
    return this.problemsApi.getAiOptimizationSuggestions(submissionId, lang);
  }

  translateCode(
    sourceCode: string,
    sourceLanguage: ProgrammingLanguageEnum,
    targetLanguage: ProgrammingLanguageEnum,
  ): Observable<ApiResponse<any>> {
    return this.problemsApi.translateCode(sourceCode, sourceLanguage, targetLanguage);
  }

  getHintLevelLabel(level: AiHintItem['level']): string {
    const labels: Record<AiHintItem['level'], string> = {
      approach: 'Approach',
      algorithm: 'Algorithm',
      pseudocode: 'Pseudocode',
      partial_code: 'Partial Code',
    };
    return labels[level];
  }
}
