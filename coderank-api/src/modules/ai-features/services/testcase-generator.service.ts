import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { AiGeneratedTestcasesEntity } from '../entities/ai-generated-testcases.entity';
import { ProblemsEntity } from 'src/modules/problems/entities/problems.entity';

interface GeneratedTestcase {
  input: string;
  expectedOutput: string;
  category: 'normal' | 'edge' | 'corner' | 'performance' | 'random';
  description: string;
  descriptionVi: string;
}

@Injectable()
export class TestcaseGeneratorService extends BaseService<AiGeneratedTestcasesEntity> {
  constructor(
    @InjectRepository(AiGeneratedTestcasesEntity)
    private readonly testcaseRepository: Repository<AiGeneratedTestcasesEntity>,
    @InjectRepository(ProblemsEntity)
    private readonly problemsRepository: Repository<ProblemsEntity>,
  ) {
    super(testcaseRepository);
  }

  /**
   * Generate testcases for a problem.
   */
  async generateTestcases(
    problemId: string,
    options: {
      includeEdgeCases?: boolean;
      includeCornerCases?: boolean;
      includePerformance?: boolean;
      count?: number;
    } = {},
  ): Promise<AiGeneratedTestcasesEntity[]> {
    const problem = await this.problemsRepository.findOne({
      where: { id: problemId },
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    const {
      includeEdgeCases = true,
      includeCornerCases = true,
      includePerformance = true,
      count = 5,
    } = options;

    // Generate testcases based on problem constraints
    const testcases = await this.analyzeAndGenerate(
      problem,
      includeEdgeCases,
      includeCornerCases,
      includePerformance,
      count,
    );

    // Save generated testcases
    const entities = testcases.map((tc) =>
      this.testcaseRepository.create({
        problemId,
        ...tc,
        isApproved: false,
        isPublic: false,
        generatedBy: 'ai',
      }),
    );

    return this.testcaseRepository.save(entities);
  }

  /**
   * Analyze problem and generate appropriate testcases.
   */
  private async analyzeAndGenerate(
    problem: ProblemsEntity,
    includeEdge: boolean,
    includeCorner: boolean,
    includePerformance: boolean,
    count: number,
  ): Promise<GeneratedTestcase[]> {
    const testcases: GeneratedTestcase[] = [];
    const description = problem.description || '';

    // Detect problem type from description
    const patterns = this.detectPatterns(description);

    // Generate normal testcases
    const normalCount = Math.max(1, Math.floor(count * 0.4));
    for (let i = 0; i < normalCount; i++) {
      testcases.push(this.generateNormalTestcase(patterns, i));
    }

    // Generate edge cases
    if (includeEdge) {
      const edgeCount = Math.max(1, Math.floor(count * 0.2));
      for (let i = 0; i < edgeCount; i++) {
        testcases.push(this.generateEdgeTestcase(patterns, i));
      }
    }

    // Generate corner cases
    if (includeCorner) {
      const cornerCount = Math.max(1, Math.floor(count * 0.2));
      for (let i = 0; i < cornerCount; i++) {
        testcases.push(this.generateCornerTestcase(patterns, i));
      }
    }

    // Generate performance testcases
    if (includePerformance) {
      const perfCount = Math.max(1, Math.floor(count * 0.2));
      for (let i = 0; i < perfCount; i++) {
        testcases.push(this.generatePerformanceTestcase(patterns, i));
      }
    }

    return testcases;
  }

  /**
   * Detect patterns from problem description.
   */
  private detectPatterns(description: string): {
    hasArray: boolean;
    hasString: boolean;
    hasNumber: boolean;
    hasGraph: boolean;
    hasTree: boolean;
    minValue?: number;
    maxValue?: number;
    maxLength?: number;
  } {
    const lower = description.toLowerCase();

    // Detect data types
    const hasArray = /array|danh sách|mảng|list/i.test(lower);
    const hasString = /string|chuỗi|xâu|text/i.test(lower);
    const hasNumber = /number|integer|số|int/i.test(lower);
    const hasGraph = /graph|đồ thị|edge|vertex|cạnh|đỉnh/i.test(lower);
    const hasTree = /tree|cây|node|root|gốc/i.test(lower);

    // Detect constraints
    const valueMatch = description.match(
      /\b(\d+)\s*[≤<]=?\s*\w+\s*[≤<]=?\s*(\d+)/,
    );
    const lengthMatch = description.match(
      /length|độ dài|kích thước|n\s*[≤<]=?\s*(\d+)/i,
    );

    return {
      hasArray,
      hasString,
      hasNumber,
      hasGraph,
      hasTree,
      minValue: valueMatch ? parseInt(valueMatch[1]) : undefined,
      maxValue: valueMatch ? parseInt(valueMatch[2]) : undefined,
      maxLength: lengthMatch ? parseInt(lengthMatch[1]) : undefined,
    };
  }

  private generateNormalTestcase(
    patterns: any,
    index: number,
  ): GeneratedTestcase {
    if (patterns.hasArray) {
      const size = 5 + index * 2;
      const arr = Array.from(
        { length: size },
        () => Math.floor(Math.random() * 100) + 1,
      );
      return {
        input: `${size}\n${arr.join(' ')}`,
        expectedOutput: '(cần được tính toán)',
        category: 'normal',
        description: `Normal test with array of ${size} elements`,
        descriptionVi: `Test bình thường với mảng ${size} phần tử`,
      };
    }

    if (patterns.hasString) {
      const length = 10 + index * 5;
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      const str = Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      return {
        input: str,
        expectedOutput: '(cần được tính toán)',
        category: 'normal',
        description: `Normal test with string of length ${length}`,
        descriptionVi: `Test bình thường với chuỗi độ dài ${length}`,
      };
    }

    // Default number test
    const num = (index + 1) * 10;
    return {
      input: `${num}`,
      expectedOutput: '(cần được tính toán)',
      category: 'normal',
      description: `Normal test with number ${num}`,
      descriptionVi: `Test bình thường với số ${num}`,
    };
  }

  private generateEdgeTestcase(
    patterns: any,
    index: number,
  ): GeneratedTestcase {
    const edgeCases = [
      { input: '0', desc: 'Zero input', descVi: 'Input bằng 0' },
      { input: '1', desc: 'Single element', descVi: 'Một phần tử' },
      { input: '-1', desc: 'Negative number', descVi: 'Số âm' },
    ];

    if (patterns.hasArray) {
      edgeCases.push(
        {
          input: '1\n1',
          desc: 'Single element array',
          descVi: 'Mảng một phần tử',
        },
        {
          input: '2\n1 1',
          desc: 'Two same elements',
          descVi: 'Hai phần tử giống nhau',
        },
      );
    }

    if (patterns.hasString) {
      edgeCases.push(
        { input: 'a', desc: 'Single character', descVi: 'Một ký tự' },
        {
          input: 'aa',
          desc: 'Two same characters',
          descVi: 'Hai ký tự giống nhau',
        },
      );
    }

    const edge = edgeCases[index % edgeCases.length];
    return {
      input: edge.input,
      expectedOutput: '(cần được tính toán)',
      category: 'edge',
      description: `Edge case: ${edge.desc}`,
      descriptionVi: `Edge case: ${edge.descVi}`,
    };
  }

  private generateCornerTestcase(
    patterns: any,
    index: number,
  ): GeneratedTestcase {
    const cornerCases = [
      {
        input: String(Number.MAX_SAFE_INTEGER),
        desc: 'Maximum integer',
        descVi: 'Số nguyên lớn nhất',
      },
      {
        input: String(Number.MIN_SAFE_INTEGER),
        desc: 'Minimum integer',
        descVi: 'Số nguyên nhỏ nhất',
      },
    ];

    if (patterns.hasArray && patterns.maxLength) {
      const bigArr = Array.from(
        { length: Math.min(patterns.maxLength, 100) },
        () => 1,
      );
      cornerCases.push({
        input: `${bigArr.length}\n${bigArr.join(' ')}`,
        desc: 'Maximum length array',
        descVi: 'Mảng kích thước tối đa',
      });
    }

    if (patterns.hasString) {
      cornerCases.push(
        { input: '', desc: 'Empty string', descVi: 'Chuỗi rỗng' },
        {
          input: 'a'.repeat(100),
          desc: 'Same character repeated',
          descVi: 'Cùng ký tự lặp lại',
        },
      );
    }

    const corner = cornerCases[index % cornerCases.length];
    return {
      input: corner.input,
      expectedOutput: '(cần được tính toán)',
      category: 'corner',
      description: `Corner case: ${corner.desc}`,
      descriptionVi: `Corner case: ${corner.descVi}`,
    };
  }

  private generatePerformanceTestcase(
    patterns: any,
    index: number,
  ): GeneratedTestcase {
    const size = 1000 * (index + 1);

    if (patterns.hasArray) {
      const arr = Array.from({ length: size }, () =>
        Math.floor(Math.random() * 1000000),
      );
      return {
        input: `${size}\n${arr.join(' ')}`,
        expectedOutput: '(cần được tính toán)',
        category: 'performance',
        description: `Performance test with ${size} elements`,
        descriptionVi: `Test hiệu năng với ${size} phần tử`,
      };
    }

    if (patterns.hasString) {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      const str = Array.from(
        { length: size },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      return {
        input: str,
        expectedOutput: '(cần được tính toán)',
        category: 'performance',
        description: `Performance test with string of length ${size}`,
        descriptionVi: `Test hiệu năng với chuỗi độ dài ${size}`,
      };
    }

    return {
      input: String(size * 1000),
      expectedOutput: '(cần được tính toán)',
      category: 'performance',
      description: `Performance test with large number`,
      descriptionVi: `Test hiệu năng với số lớn`,
    };
  }

  /**
   * Approve a generated testcase.
   */
  async approveTestcase(testcaseId: string, isPublic: boolean = false) {
    return this.update(testcaseId, {
      isApproved: true,
      isPublic,
    });
  }

  /**
   * Get generated testcases for a problem.
   */
  async getTestcasesForProblem(
    problemId: string,
    approvedOnly: boolean = false,
  ) {
    const query = this.testcaseRepository
      .createQueryBuilder('tc')
      .where('tc.problemId = :problemId', { problemId });

    if (approvedOnly) {
      query.andWhere('tc.isApproved = :approved', { approved: true });
    }

    return query.orderBy('tc.category', 'ASC').getMany();
  }
}
