import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface CreateProblemPayload {
  title: string;
  slug: string;
  statement: string;
  difficulty: string;
  tags?: string[];
  timeLimitMs?: number;
  memoryLimitMb?: number;
  visibility?: string;
  [key: string]: unknown;
}

@Injectable()
export class CoderankProblemsApiService {
  async createProblem(
    payload: CreateProblemPayload,
    accessToken?: string,
  ): Promise<unknown> {
    if (!accessToken?.trim()) {
      throw new UnauthorizedException(
        'Missing access token for coderank-api call',
      );
    }

    const endpoint = this.buildProblemsEndpoint();
    const bearerToken = accessToken.trim();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `coderank_api_error: POST ${endpoint} -> ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as unknown;
    }

    return await response.text();
  }

  private buildProblemsEndpoint(): string {
    const baseUrl =
      process.env.CODERANK_API_BASE_URL ?? 'http://127.0.0.1:3000';
    const path = process.env.CODERANK_API_PROBLEMS_PATH ?? '/problems';
    return new URL(path, baseUrl).toString();
  }
}
