export interface ContextWindowPolicy {
  maxInputTokens: number;
  outputReserveTokens: number;
  historyRetentionRatio: number;
  maxToolResponseChars: number;
  maxToolResponsesTotalChars: number;
  summaryMaxChars: number;
}

export interface HistoryTrimResult<T> {
  messages: T[];
  droppedCount: number;
  estimatedTokens: number;
  budgetTokens: number;
}

export interface ToolCompactionResult {
  payload: any[];
  compactedCount: number;
  totalCharsBefore: number;
  totalCharsAfter: number;
}
