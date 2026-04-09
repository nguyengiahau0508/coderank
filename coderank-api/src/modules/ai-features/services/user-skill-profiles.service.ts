import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';
import { UserSkillProfilesEntity } from '../entities/user-skill-profiles.entity';
import { SubmissionsEntity } from 'src/modules/problems/entities/submissions.entity';
import { SubmissionStatusEnum } from 'src/common/enums/enums';

@Injectable()
export class UserSkillProfilesService extends BaseService<UserSkillProfilesEntity> {
  constructor(
    @InjectRepository(UserSkillProfilesEntity)
    private readonly skillProfileRepository: Repository<UserSkillProfilesEntity>,
    @InjectRepository(SubmissionsEntity)
    private readonly submissionsRepository: Repository<SubmissionsEntity>,
  ) {
    super(skillProfileRepository);
  }

  /**
   * Get or create skill profile for a user.
   */
  async getOrCreateProfile(userId: string): Promise<UserSkillProfilesEntity> {
    let profile = await this.skillProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.skillProfileRepository.create({
        userId,
        topicSkills: {},
        strengths: [],
        weaknesses: [],
      });
      await this.skillProfileRepository.save(profile);
    }

    return profile;
  }

  /**
   * Analyze user submissions and update skill profile.
   */
  async analyzeAndUpdateProfile(userId: string): Promise<UserSkillProfilesEntity> {
    const profile = await this.getOrCreateProfile(userId);

    // Get all submissions for the user
    const submissions = await this.submissionsRepository
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.problem', 'problem')
      .leftJoinAndSelect('problem.tags', 'tags')
      .where('sub.authorId = :userId', { userId })
      .getMany();

    if (submissions.length === 0) {
      return profile;
    }

    // Calculate metrics
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(
      s => s.status === SubmissionStatusEnum.Accepted
    );
    
    // Group by problem to count unique problems solved
    const problemStats = new Map<string, {
      solved: boolean;
      attempts: number;
      difficulty: string;
      tags: string[];
    }>();

    for (const sub of submissions) {
      const problemId = sub.problemId;
      const existing = problemStats.get(problemId);
      
      if (existing) {
        existing.attempts++;
        if (sub.status === SubmissionStatusEnum.Accepted) {
          existing.solved = true;
        }
      } else {
        problemStats.set(problemId, {
          solved: sub.status === SubmissionStatusEnum.Accepted,
          attempts: 1,
          difficulty: sub.problem?.difficulty || 'medium',
          tags: sub.problem?.tags?.map(t => t.name) || [],
        });
      }
    }

    // Calculate topic skills
    const topicSkills: Record<string, any> = {};
    
    for (const [_, stats] of problemStats) {
      for (const tag of stats.tags) {
        if (!topicSkills[tag]) {
          topicSkills[tag] = {
            level: 0,
            problemsSolved: 0,
            totalProblems: 0,
            averageAttempts: 0,
            attempts: [],
          };
        }
        
        topicSkills[tag].totalProblems++;
        if (stats.solved) {
          topicSkills[tag].problemsSolved++;
        }
        topicSkills[tag].attempts.push(stats.attempts);
      }
    }

    // Calculate levels and averages
    for (const tag of Object.keys(topicSkills)) {
      const skill = topicSkills[tag];
      skill.averageAttempts = 
        skill.attempts.reduce((a: number, b: number) => a + b, 0) / skill.attempts.length;
      
      // Calculate level (0-100) based on problems solved and attempts
      const solveRate = skill.problemsSolved / Math.max(1, skill.totalProblems);
      const attemptBonus = Math.max(0, 1 - (skill.averageAttempts - 1) * 0.1);
      skill.level = Math.round(solveRate * attemptBonus * 100);
      
      delete skill.attempts; // Remove temporary data
      delete skill.totalProblems;
    }

    // Identify strengths and weaknesses
    const sortedSkills = Object.entries(topicSkills)
      .filter(([_, s]: any) => s.problemsSolved >= 2)
      .sort(([, a]: any, [, b]: any) => b.level - a.level);

    const strengths = sortedSkills.slice(0, 5).map(([tag]) => tag);
    const weaknesses = sortedSkills.slice(-5).reverse().map(([tag]) => tag);

    // Difficulty counts
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;
    for (const [_, stats] of problemStats) {
      if (stats.solved) {
        switch (stats.difficulty) {
          case 'easy': easySolved++; break;
          case 'medium': mediumSolved++; break;
          case 'hard': hardSolved++; break;
        }
      }
    }

    // Update profile
    profile.topicSkills = topicSkills;
    profile.strengths = strengths;
    profile.weaknesses = weaknesses;
    profile.totalProblemsSolved = [...problemStats.values()].filter(s => s.solved).length;
    profile.totalSubmissions = totalSubmissions;
    profile.averageAccuracy = (acceptedSubmissions.length / totalSubmissions) * 100;
    profile.averageAttemptsPerProblem = 
      [...problemStats.values()].reduce((sum, s) => sum + s.attempts, 0) / problemStats.size;
    profile.easySolved = easySolved;
    profile.mediumSolved = mediumSolved;
    profile.hardSolved = hardSolved;
    profile.lastAnalyzedAt = new Date();

    // Determine learning pace
    if (profile.averageAttemptsPerProblem <= 1.5) {
      profile.learningPace = 'fast';
    } else if (profile.averageAttemptsPerProblem <= 3) {
      profile.learningPace = 'moderate';
    } else {
      profile.learningPace = 'slow';
    }

    // Preferred difficulty
    const totalSolved = easySolved + mediumSolved + hardSolved;
    if (hardSolved / totalSolved > 0.3) {
      profile.preferredDifficulty = 'hard';
    } else if (mediumSolved / totalSolved > 0.5) {
      profile.preferredDifficulty = 'medium';
    } else {
      profile.preferredDifficulty = 'easy';
    }

    await this.skillProfileRepository.save(profile);

    return profile;
  }

  /**
   * Get recommended problems based on skill profile.
   */
  async getRecommendedProblems(userId: string, limit: number = 10) {
    const profile = await this.analyzeAndUpdateProfile(userId);

    // Get problems the user hasn't solved yet
    const solvedProblemIds = await this.submissionsRepository
      .createQueryBuilder('sub')
      .select('DISTINCT sub.problemId', 'problemId')
      .where('sub.authorId = :userId', { userId })
      .andWhere('sub.status = :status', { status: SubmissionStatusEnum.Accepted })
      .getRawMany();

    const solvedIds = solvedProblemIds.map(r => r.problemId);

    // Build recommendation query
    // Prioritize: weaknesses > appropriate difficulty > variety
    const query = this.submissionsRepository.manager
      .createQueryBuilder()
      .select('problem')
      .from('problems', 'problem')
      .leftJoin('problem.tags', 'tags')
      .where('problem.isPublished = :published', { published: true });

    if (solvedIds.length > 0) {
      query.andWhere('problem.id NOT IN (:...solvedIds)', { solvedIds });
    }

    // Prefer problems matching weaknesses
    if (profile.weaknesses && profile.weaknesses.length > 0) {
      query.orderBy(
        `CASE WHEN tags.name IN (:...weaknesses) THEN 0 ELSE 1 END`,
        'ASC'
      );
      query.setParameter('weaknesses', profile.weaknesses);
    }

    query.addOrderBy('RAND()');
    query.limit(limit);

    return query.getMany();
  }
}
