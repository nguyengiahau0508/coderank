import { BaseModel, ContestStatusEnum, ProgrammingLanguageEnum, SubmissionStatusEnum } from "../../../shared";
import { ProblemsModel } from "../../problems";
import { UsersModel } from "../../users";


export interface ContestsModel extends BaseModel {
  title: string;
  slug: string;
  description: string | null;
  rules: string | null;
  startTime: string;
  endTime: string;
  durationMinutes: number | null;
  status: ContestStatusEnum;
  isPublic: boolean;
  isRated: boolean;
  maxParticipants: number;
  password: string | null;
  author: UsersModel | null;
  contestProblems: ContestProblemsModel[];
  participants: ContestParticipantsModel[];
}

export interface ContestProblemsModel extends BaseModel {
  contestId: string;
  problemId: string;
  problemOrder: number;
  points: number;
  label: string | null;
  contest: ContestsModel | null;
  problem: ProblemsModel | null;
}

export interface ContestParticipantsModel extends BaseModel {
  contestId: string;
  userId: string;
  joinedAt: string | null;
  totalScore: number;
  rank: number | null;
  solvedProblems: number;
  penaltyMinutes: number | null;
  isFinalized: boolean;
  contest: ContestsModel | null;
  user: UsersModel | null;
}

export interface ContestSubmissionsModel extends BaseModel {
  contestId: string;
  userId: string;
  problemId: string;
  code: string;
  language: ProgrammingLanguageEnum;
  status: SubmissionStatusEnum;
  score: number;
  executionTimeMs: number | null;
  memoryUsedMb: number | null;
  passedTestcases: number;
  totalTestcases: number;
  errorMessage: string | null;
  submittedAt: string;
  contest: ContestsModel | null;
  user: UsersModel | null;
  problem: ProblemsModel | null;
}
