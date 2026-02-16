import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from './base.api';
import { ApiResponse } from '../interfaces';

export interface RunCodeDto {
  code: string;
  language: string;
  input?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface RunResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'MEMORY_EXCEEDED';
}

/**
 * Code Runner API Service
 * Handles code execution and testing
 */
@Injectable({
  providedIn: 'root'
})
export class RunnerApi extends BaseApi {
  protected readonly endpoint = '/runner';

  /**
   * Run code with input
   */
  runCode(dto: RunCodeDto): Observable<ApiResponse<RunResult>> {
    return this.apiService.post<ApiResponse<RunResult>>(
      this.getUrl('/run'),
      dto
    );
  }
}
