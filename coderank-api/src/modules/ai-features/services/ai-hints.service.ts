import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { AiHintsEntity } from '../entities/ai-hints.entity';
import { AiHintLevelEnum } from 'src/common/enums/enums';
import { AgentService } from 'src/modules/agent/agent.service';
import { ProblemsService } from 'src/modules/problems/services/problems.service';

@Injectable()
export class AiHintsService extends BaseService<AiHintsEntity> {
  constructor(
    @InjectRepository(AiHintsEntity)
    private readonly aiHintsRepository: Repository<AiHintsEntity>,
    private readonly agentService: AgentService,
    private readonly problemsService: ProblemsService,
  ) {
    super(aiHintsRepository);
  }

  /**
   * Get hints for a problem up to a certain level.
   */
  async getHintsForProblem(
    problemId: string,
    maxLevel?: AiHintLevelEnum,
    lang: 'vi' | 'en' = 'vi',
  ) {
    const query = this.aiHintsRepository
      .createQueryBuilder('hint')
      .where('hint.problemId = :problemId', { problemId })
      .andWhere('hint.isActive = :isActive', { isActive: true })
      .orderBy('hint.order', 'ASC');

    if (maxLevel) {
      const levelOrder = Object.values(AiHintLevelEnum);
      const maxIndex = levelOrder.indexOf(maxLevel);
      const allowedLevels = levelOrder.slice(0, maxIndex + 1);
      query.andWhere('hint.level IN (:...levels)', { levels: allowedLevels });
    }

    const hints = await query.getMany();

    // Return with the appropriate language content
    return hints.map(hint => ({
      id: hint.id,
      level: hint.level,
      content: lang === 'vi' ? hint.contentVi : hint.contentEn,
      order: hint.order,
    }));
  }

  /**
   * Generate hints for a problem using AI.
   */
  async generateHints(
    problemId: string,
    maxLevel: AiHintLevelEnum = AiHintLevelEnum.Algorithm,
    forceRegenerate: boolean = false,
  ) {
    // Check if hints already exist
    if (!forceRegenerate) {
      const existingHints = await this.aiHintsRepository.count({
        where: { problemId, isActive: true },
      });
      if (existingHints > 0) {
        return { generated: false, message: 'Hints already exist' };
      }
    }

    // Get problem details
    const problem = await this.problemsService.findOne({
      where: { id: problemId },
      select: ['id', 'title', 'description', 'inputDescription', 'outputDescription', 'difficulty'],
    });

    if (!problem) {
      throw new Error('Problem not found');
    }

    // Generate hints using AI (simplified - would call agent in real implementation)
    const levelOrder = Object.values(AiHintLevelEnum);
    const maxIndex = levelOrder.indexOf(maxLevel);
    const levelsToGenerate = levelOrder.slice(0, maxIndex + 1);

    const generatedHints: AiHintsEntity[] = [];

    for (let i = 0; i < levelsToGenerate.length; i++) {
      const level = levelsToGenerate[i];
      
      // In a real implementation, this would call the AI agent
      // For now, create placeholder that will be filled by AI
      const hint = this.aiHintsRepository.create({
        problemId,
        level,
        contentVi: await this.generateHintContent(problem, level, 'vi'),
        contentEn: await this.generateHintContent(problem, level, 'en'),
        order: i,
        generatedBy: 'gemini', // Will be dynamic based on available provider
      });

      generatedHints.push(hint);
    }

    // Deactivate old hints if regenerating
    if (forceRegenerate) {
      await this.aiHintsRepository.update(
        { problemId, isActive: true },
        { isActive: false },
      );
    }

    await this.aiHintsRepository.save(generatedHints);

    return {
      generated: true,
      count: generatedHints.length,
      hints: generatedHints.map(h => ({
        id: h.id,
        level: h.level,
        order: h.order,
      })),
    };
  }

  private async generateHintContent(
    problem: any,
    level: AiHintLevelEnum,
    lang: 'vi' | 'en',
  ): Promise<string> {
    // This would be replaced with actual AI generation
    const templates = {
      vi: {
        [AiHintLevelEnum.Approach]: `Hãy suy nghĩ về cách tiếp cận tổng quát cho bài "${problem.title}". Xem xét các pattern phổ biến có thể áp dụng.`,
        [AiHintLevelEnum.Algorithm]: `Với bài toán này, bạn có thể cân nhắc sử dụng một thuật toán phù hợp với độ khó ${problem.difficulty}.`,
        [AiHintLevelEnum.Pseudocode]: `Các bước giải:\n1. Đọc input\n2. Xử lý dữ liệu\n3. Xuất output`,
        [AiHintLevelEnum.PartialCode]: `// Bắt đầu với việc khởi tạo các biến cần thiết\n// Sau đó xử lý từng test case`,
      },
      en: {
        [AiHintLevelEnum.Approach]: `Think about the general approach for "${problem.title}". Consider common patterns that might apply.`,
        [AiHintLevelEnum.Algorithm]: `For this problem, consider using an algorithm suitable for ${problem.difficulty} difficulty.`,
        [AiHintLevelEnum.Pseudocode]: `Solution steps:\n1. Read input\n2. Process data\n3. Output result`,
        [AiHintLevelEnum.PartialCode]: `// Start by initializing necessary variables\n// Then process each test case`,
      },
    };

    return templates[lang][level];
  }
}
