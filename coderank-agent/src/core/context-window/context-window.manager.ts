import { ContextWindowPolicy, ToolCompactionResult } from './context-window.interface';
import { stringifySafe } from './token-estimator';

export class ContextWindowManager {
  constructor(private readonly policy: ContextWindowPolicy) {}

  compactToolResponses(toolResponses: any[]): ToolCompactionResult {
    if (!Array.isArray(toolResponses) || toolResponses.length === 0) {
      return {
        payload: toolResponses,
        compactedCount: 0,
        totalCharsBefore: 0,
        totalCharsAfter: 0,
      };
    }

    const compactedPayload: any[] = [];
    let compactedCount = 0;
    let totalCharsBefore = 0;
    let totalCharsAfter = 0;

    for (const item of toolResponses) {
      const beforeText = stringifySafe(item?.functionResponse?.response);
      const beforeChars = beforeText.length;
      totalCharsBefore += beforeChars;

      const limited = this.limitToolPayload(item, beforeText, beforeChars, totalCharsAfter);
      if (limited.compacted) {
        compactedCount += 1;
      }

      const afterText = stringifySafe(limited.payload?.functionResponse?.response);
      totalCharsAfter += afterText.length;
      compactedPayload.push(limited.payload);
    }

    return {
      payload: compactedPayload,
      compactedCount,
      totalCharsBefore,
      totalCharsAfter,
    };
  }

  private limitToolPayload(item: any, serializedResponse: string, responseChars: number, currentTotalChars: number) {
    if (!item?.functionResponse) {
      return { payload: item, compacted: false };
    }

    const singleLimitExceeded = responseChars > this.policy.maxToolResponseChars;
    const totalLimitExceeded = currentTotalChars + responseChars > this.policy.maxToolResponsesTotalChars;

    if (!singleLimitExceeded && !totalLimitExceeded) {
      return { payload: item, compacted: false };
    }

    const name = item.functionResponse.name || 'unknown_tool';
    const summary = this.toSummary(serializedResponse);

    const compacted = {
      functionResponse: {
        name,
        response: {
          _meta: {
            truncated: true,
            originalChars: responseChars,
            reason: singleLimitExceeded ? 'single_limit' : 'total_limit',
          },
          summary,
        },
      },
    };

    return { payload: compacted, compacted: true };
  }

  private toSummary(text: string): string {
    if (!text) {
      return '';
    }

    if (text.length <= this.policy.summaryMaxChars) {
      return text;
    }

    const clipped = text.slice(0, this.policy.summaryMaxChars);
    return `${clipped}...[truncated ${text.length - this.policy.summaryMaxChars} chars]`;
  }
}
