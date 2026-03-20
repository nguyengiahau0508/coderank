import { Injectable } from '@nestjs/common';
import { TestcaseCompareTypeEnum } from 'src/common/enums/enums';
import { ICheckResult } from 'src/common/interfaces/interfaces';

@Injectable()
export class CheckerService {
  /**
   * Compare actual output with expected output based on compare type
   * @param actualOutput - The output from running the code
   * @param expectedOutput - The expected correct output
   * @param compareType - The comparison method to use
   * @returns CheckResult with passed status and details
   */
  check(
    actualOutput: string,
    expectedOutput: string,
    compareType: TestcaseCompareTypeEnum = TestcaseCompareTypeEnum.Exact,
  ): ICheckResult {
    switch (compareType) {
      case TestcaseCompareTypeEnum.Exact:
        return this.checkExact(actualOutput, expectedOutput);

      case TestcaseCompareTypeEnum.TrimWhitespace:
        return this.checkTrimWhitespace(actualOutput, expectedOutput);

      case TestcaseCompareTypeEnum.Tokenize:
        return this.checkTokenize(actualOutput, expectedOutput);

      default:
        return {
          passed: false,
          expectedOutput,
          actualOutput,
          message: `Unknown compare type: ${compareType}`,
        };
    }
  }

  /**
   * Exact comparison - outputs must match exactly including whitespace
   */
  private checkExact(
    actualOutput: string,
    expectedOutput: string,
  ): ICheckResult {
    const passed = actualOutput === expectedOutput;
    return {
      passed,
      expectedOutput,
      actualOutput,
      message: passed ? 'Exact match' : 'Output does not match exactly',
    };
  }

  /**
   * Trim whitespace comparison - trims leading/trailing whitespace from each line
   * and ignores trailing empty lines
   */
  private checkTrimWhitespace(
    actualOutput: string,
    expectedOutput: string,
  ): ICheckResult {
    const normalizeOutput = (output: string): string => {
      return output
        .split('\n')
        .map((line) => line.trimEnd()) // Trim trailing whitespace from each line
        .join('\n')
        .trimEnd(); // Remove trailing empty lines
    };

    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    const passed = normalizedActual === normalizedExpected;

    return {
      passed,
      expectedOutput,
      actualOutput,
      message: passed
        ? 'Match after trimming whitespace'
        : 'Output does not match after trimming whitespace',
    };
  }

  /**
   * Tokenize comparison - splits output into tokens and compares them
   * Ignores all whitespace differences
   */
  private checkTokenize(
    actualOutput: string,
    expectedOutput: string,
  ): ICheckResult {
    const tokenize = (output: string): string[] => {
      return output
        .trim()
        .split(/\s+/) // Split by any whitespace
        .filter((token) => token.length > 0); // Remove empty tokens
    };

    const actualTokens = tokenize(actualOutput);
    const expectedTokens = tokenize(expectedOutput);

    // Compare token count first
    if (actualTokens.length !== expectedTokens.length) {
      return {
        passed: false,
        expectedOutput,
        actualOutput,
        message: `Token count mismatch: expected ${expectedTokens.length}, got ${actualTokens.length}`,
      };
    }

    // Compare each token
    for (let i = 0; i < expectedTokens.length; i++) {
      if (actualTokens[i] !== expectedTokens[i]) {
        return {
          passed: false,
          expectedOutput,
          actualOutput,
          message: `Token mismatch at position ${i + 1}: expected "${expectedTokens[i]}", got "${actualTokens[i]}"`,
        };
      }
    }

    return {
      passed: true,
      expectedOutput,
      actualOutput,
      message: 'Match after tokenization',
    };
  }

  /**
   * Helper method for batch checking multiple testcases
   */
  checkMultiple(
    testcases: Array<{
      actualOutput: string;
      expectedOutput: string;
      compareType: TestcaseCompareTypeEnum;
    }>,
  ): ICheckResult[] {
    return testcases.map((tc) =>
      this.check(tc.actualOutput, tc.expectedOutput, tc.compareType),
    );
  }
}
