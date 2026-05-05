import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import slugify from 'slugify';
import { ContestsEntity } from '../../modules/contests/entities/contests.entity';
import { ContestProblemsEntity } from '../../modules/contests/entities/contest-problems.entity';
import { ContestParticipantsEntity } from '../../modules/contests/entities/contest-participants.entity';
import { ContestSubmissionsEntity } from '../../modules/contests/entities/contest-submissions.entity';
import { UsersEntity } from '../../modules/users/entities/user.entity';
import { ProblemsEntity } from '../../modules/problems/entities/problems.entity';
import {
  ContestStatusEnum,
  ProgrammingLanguageEnum,
  SubmissionStatusEnum,
} from '../../common/enums/enums';

export async function seedContests(
  dataSource: DataSource,
  users: UsersEntity[],
  problems: ProblemsEntity[],
) {
  console.log('🌱 Seeding contests...');

  const contestRepo = dataSource.getRepository(ContestsEntity);
  const contestProblemRepo = dataSource.getRepository(ContestProblemsEntity);
  const participantRepo = dataSource.getRepository(ContestParticipantsEntity);
  const submissionRepo = dataSource.getRepository(ContestSubmissionsEntity);

  const instructors = users.filter((u) =>
    u.roles.includes('instructor' as any),
  );
  const students = users.filter((u) => u.roles.includes('student' as any));

  const contestTitles = [
    'CodeRank Weekly Contest #1',
    'CodeRank Weekly Contest #2',
    'CodeRank Weekly Contest #3',
    'Algorithm Championship 2026',
    'Data Structures Challenge',
    'Dynamic Programming Marathon',
    'Graph Theory Competition',
    'String Algorithms Battle',
    'Beginner Friendly Contest',
    'Advanced Algorithms Showdown',
  ];

  const contests: ContestsEntity[] = [];

  for (const title of contestTitles) {
    const organizer = faker.helpers.arrayElement(instructors);
    const startTime = faker.date.between({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    const duration = faker.helpers.arrayElement([60, 90, 120, 180]);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    let status: ContestStatusEnum;
    const now = new Date();
    if (now < startTime) {
      status = ContestStatusEnum.Upcoming;
    } else if (now >= startTime && now <= endTime) {
      status = ContestStatusEnum.Running;
    } else {
      status = ContestStatusEnum.Ended;
    }

    const contest = contestRepo.create({
      title,
      slug: slugify(title, { lower: true }),
      description: faker.lorem.paragraphs(2),
      rules: faker.lorem.paragraph(),
      startTime,
      endTime,
      durationMinutes: duration,
      status,
      isPublic: faker.datatype.boolean(0.8),
      isRated: faker.datatype.boolean(0.7),
      isRankCalculated: status === ContestStatusEnum.Ended,
      password: faker.datatype.boolean(0.2)
        ? faker.internet.password()
        : undefined,
      maxParticipants: faker.helpers.arrayElement([0, 50, 100, 200]),
      authorId: organizer.id,
    });
    contests.push(contest);
  }
  await contestRepo.save(contests);

  // Add problems to contests
  const contestProblems: ContestProblemsEntity[] = [];
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (const contest of contests) {
    const numProblems = faker.number.int({ min: 3, max: 6 });
    const selectedProblems = faker.helpers.arrayElements(problems, numProblems);

    for (let i = 0; i < selectedProblems.length; i++) {
      const contestProblem = contestProblemRepo.create({
        contestId: contest.id,
        problemId: selectedProblems[i].id,
        problemOrder: i,
        points: (i + 1) * 100,
        label: labels[i],
      });
      contestProblems.push(contestProblem);
    }
  }
  await contestProblemRepo.save(contestProblems);

  // Create participants
  const participants: ContestParticipantsEntity[] = [];
  for (const contest of contests) {
    const numParticipants = faker.number.int({ min: 10, max: 40 });
    const contestStudents = faker.helpers.arrayElements(
      students,
      numParticipants,
    );

    for (const student of contestStudents) {
      const participant = participantRepo.create({
        contestId: contest.id,
        userId: student.id,
        totalScore: 0,
        solvedProblems: 0,
        joinedAt: faker.date.past(),
        oldRating: student.eloRating,
        isFinalized: contest.status === ContestStatusEnum.Ended,
      });
      participants.push(participant);
    }
  }
  await participantRepo.save(participants);

  // Create contest submissions
  const submissions: ContestSubmissionsEntity[] = [];
  for (const contest of contests) {
    if (contest.status === ContestStatusEnum.Upcoming) continue;

    const contestParticipants = participants.filter(
      (p) => p.contestId === contest.id,
    );
    const contestProblemsList = contestProblems.filter(
      (cp) => cp.contestId === contest.id,
    );

    for (const participant of contestParticipants) {
      const numSubmissions = faker.number.int({
        min: 1,
        max: contestProblemsList.length * 3,
      });

      for (let i = 0; i < numSubmissions; i++) {
        const contestProblem = faker.helpers.arrayElement(contestProblemsList);
        const status = faker.helpers.arrayElement(
          Object.values(SubmissionStatusEnum),
        );
        const totalTests = faker.number.int({ min: 5, max: 10 });
        const passedTests =
          status === SubmissionStatusEnum.Accepted
            ? totalTests
            : faker.number.int({ min: 0, max: totalTests });

        const submission = submissionRepo.create({
          contestId: contest.id,
          problemId: contestProblem.problemId,
          userId: participant.userId,
          language: faker.helpers.arrayElement(
            Object.values(ProgrammingLanguageEnum),
          ),
          code: faker.lorem.paragraphs(2),
          status,
          score:
            status === SubmissionStatusEnum.Accepted
              ? contestProblem.points
              : 0,
          executionTimeMs: faker.number.int({ min: 10, max: 1000 }),
          memoryUsedMb: faker.number.int({ min: 1, max: 100 }),
          passedTestcases: passedTests,
          totalTestcases: totalTests,
          errorMessage:
            status !== SubmissionStatusEnum.Accepted
              ? faker.lorem.sentence()
              : undefined,
          submittedAt: faker.date.between({
            from: contest.startTime,
            to: contest.endTime,
          }),
        });
        submissions.push(submission);
      }
    }
  }
  await submissionRepo.save(submissions);

  // Calculate participant scores and ranks
  for (const contest of contests) {
    const contestParticipants = participants.filter(
      (p) => p.contestId === contest.id,
    );
    const contestSubmissions = submissions.filter(
      (s) => s.contestId === contest.id,
    );

    for (const participant of contestParticipants) {
      const userSubmissions = contestSubmissions.filter(
        (s) => s.userId === participant.userId,
      );

      const problemScores = new Map<string, number>();
      for (const submission of userSubmissions) {
        const currentScore = problemScores.get(submission.problemId) || 0;
        if (submission.score > currentScore) {
          problemScores.set(submission.problemId, submission.score);
        }
      }

      participant.totalScore = Array.from(problemScores.values()).reduce(
        (a, b) => a + b,
        0,
      );
      participant.solvedProblems = Array.from(problemScores.values()).filter(
        (s) => s > 0,
      ).length;
      participant.penaltyMinutes = faker.number.int({ min: 0, max: 100 });
    }

    contestParticipants.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return (a.penaltyMinutes || 0) - (b.penaltyMinutes || 0);
    });

    contestParticipants.forEach((p, index) => {
      p.rank = index + 1;
      if (contest.isRated && contest.status === ContestStatusEnum.Ended) {
        p.newRating =
          (p.oldRating || 1400) + faker.number.int({ min: -50, max: 100 });
        p.ratingDelta = p.newRating - (p.oldRating || 1400);
      }
    });

    await participantRepo.save(contestParticipants);
  }

  await contestRepo.save(contests);

  console.log(
    `✅ Created ${contests.length} contests, ${contestProblems.length} contest problems, ${participants.length} participants, ${submissions.length} submissions`,
  );
  return contests;
}
