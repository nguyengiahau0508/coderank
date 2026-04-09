import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { LearningPathsEntity } from '../entities/learning-paths.entity';
import { UserSkillProfilesService } from './user-skill-profiles.service';

interface LearningStep {
  order: number;
  title: string;
  description: string;
  type: 'topic' | 'problem' | 'quiz' | 'project';
  resourceId?: string;
  estimatedTime?: number;
  isCompleted: boolean;
  completedAt?: string;
}

@Injectable()
export class LearningPathsService extends BaseService<LearningPathsEntity> {
  constructor(
    @InjectRepository(LearningPathsEntity)
    private readonly learningPathRepository: Repository<LearningPathsEntity>,
    private readonly skillProfilesService: UserSkillProfilesService,
  ) {
    super(learningPathRepository);
  }

  /**
   * Get all learning paths for a user.
   */
  async getUserLearningPaths(userId: string) {
    return this.learningPathRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get active learning path for a user.
   */
  async getActiveLearningPath(userId: string) {
    return this.learningPathRepository.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Generate a personalized learning path.
   */
  async generateLearningPath(
    userId: string,
    goalTopic: string,
    targetLevel:
      | 'beginner'
      | 'intermediate'
      | 'advanced'
      | 'expert' = 'intermediate',
  ): Promise<LearningPathsEntity> {
    // Get user's current skill profile
    const profile =
      await this.skillProfilesService.analyzeAndUpdateProfile(userId);

    // Determine current level in the goal topic
    const currentSkill = profile.topicSkills?.[goalTopic];
    const currentLevel = currentSkill?.level || 0;

    // Generate steps based on goal and current level
    const steps = this.generateSteps(goalTopic, targetLevel, currentLevel);

    // Create learning path
    const learningPath = this.learningPathRepository.create({
      userId,
      title: `${goalTopic} Learning Path`,
      description: `Personalized path to master ${goalTopic} at ${targetLevel} level`,
      goalTopic,
      targetLevel,
      steps,
      totalSteps: steps.length,
      completedSteps: 0,
      progressPercent: 0,
      status: 'active',
      estimatedTotalMinutes: steps.reduce(
        (sum, s) => sum + (s.estimatedTime || 30),
        0,
      ),
      generatedBy: 'system',
      startedAt: new Date(),
    });

    await this.learningPathRepository.save(learningPath);

    return learningPath;
  }

  /**
   * Mark a step as completed.
   */
  async completeStep(
    pathId: string,
    stepIndex: number,
  ): Promise<LearningPathsEntity> {
    const path = await this.learningPathRepository.findOne({
      where: { id: pathId },
    });

    if (!path) {
      throw new Error('Learning path not found');
    }

    if (stepIndex < 0 || stepIndex >= path.steps.length) {
      throw new Error('Invalid step index');
    }

    // Mark step as completed
    path.steps[stepIndex].isCompleted = true;
    path.steps[stepIndex].completedAt = new Date().toISOString();

    // Update progress
    path.completedSteps = path.steps.filter((s) => s.isCompleted).length;
    path.progressPercent = (path.completedSteps / path.totalSteps) * 100;

    // Move to next step
    if (
      stepIndex === path.currentStepIndex &&
      stepIndex < path.steps.length - 1
    ) {
      path.currentStepIndex = stepIndex + 1;
    }

    // Check if completed
    if (path.completedSteps === path.totalSteps) {
      path.status = 'completed';
      path.completedAt = new Date();
    }

    await this.learningPathRepository.save(path);

    return path;
  }

  /**
   * Generate learning steps for a topic.
   */
  private generateSteps(
    topic: string,
    targetLevel: string,
    currentLevel: number,
  ): LearningStep[] {
    const steps: LearningStep[] = [];
    let order = 0;

    // Topic introduction
    if (currentLevel < 30) {
      steps.push({
        order: order++,
        title: `Introduction to ${topic}`,
        description: `Learn the fundamentals and key concepts of ${topic}`,
        type: 'topic',
        estimatedTime: 30,
        isCompleted: false,
      });
    }

    // Basic problems
    if (currentLevel < 50 || targetLevel === 'beginner') {
      steps.push({
        order: order++,
        title: `Basic ${topic} Problems`,
        description: `Practice easy problems to build foundation`,
        type: 'problem',
        estimatedTime: 45,
        isCompleted: false,
      });

      steps.push({
        order: order++,
        title: `${topic} Patterns Quiz`,
        description: `Test your understanding of basic patterns`,
        type: 'quiz',
        estimatedTime: 15,
        isCompleted: false,
      });
    }

    // Intermediate level
    if (
      targetLevel !== 'beginner' &&
      (currentLevel < 70 || targetLevel === 'intermediate')
    ) {
      steps.push({
        order: order++,
        title: `Intermediate ${topic} Techniques`,
        description: `Learn advanced techniques and optimizations`,
        type: 'topic',
        estimatedTime: 45,
        isCompleted: false,
      });

      steps.push({
        order: order++,
        title: `Medium ${topic} Problems`,
        description: `Practice medium difficulty problems`,
        type: 'problem',
        estimatedTime: 60,
        isCompleted: false,
      });
    }

    // Advanced level
    if (targetLevel === 'advanced' || targetLevel === 'expert') {
      steps.push({
        order: order++,
        title: `Advanced ${topic} Concepts`,
        description: `Master complex scenarios and edge cases`,
        type: 'topic',
        estimatedTime: 60,
        isCompleted: false,
      });

      steps.push({
        order: order++,
        title: `Hard ${topic} Problems`,
        description: `Challenge yourself with hard problems`,
        type: 'problem',
        estimatedTime: 90,
        isCompleted: false,
      });
    }

    // Expert level
    if (targetLevel === 'expert') {
      steps.push({
        order: order++,
        title: `${topic} Competition Problems`,
        description: `Solve competitive programming problems`,
        type: 'problem',
        estimatedTime: 120,
        isCompleted: false,
      });

      steps.push({
        order: order++,
        title: `${topic} Mini Project`,
        description: `Apply your knowledge in a practical project`,
        type: 'project',
        estimatedTime: 180,
        isCompleted: false,
      });
    }

    // Final assessment
    steps.push({
      order: order++,
      title: `${topic} Final Assessment`,
      description: `Comprehensive test of your ${topic} skills`,
      type: 'quiz',
      estimatedTime: 30,
      isCompleted: false,
    });

    return steps;
  }
}
