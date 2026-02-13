export interface ICheckResult {
  passed: boolean;
  expectedOutput: string;
  actualOutput: string;
  message?: string;
}
