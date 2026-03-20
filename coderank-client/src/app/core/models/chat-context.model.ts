/**
 * Chat Context Models
 * Defines the context types that can be passed to AI chat for better assistance
 */

export type ChatContextType = 'problem' | 'course' | 'lesson' | 'contest' | 'submission';

export interface BaseChatContext {
  type: ChatContextType;
  title: string;
  description?: string;
}

export interface ProblemChatContext extends BaseChatContext {
  type: 'problem';
  problemId: number | string;
  difficulty: string;
  tags?: string[];
  userCode?: string;
  lastSubmissionStatus?: string;
}

export interface CourseChatContext extends BaseChatContext {
  type: 'course';
  courseId: number | string;
  level: string;
  currentLessonTitle?: string;
}

export interface LessonChatContext extends BaseChatContext {
  type: 'lesson';
  lessonId: number | string;
  courseTitle: string;
}

export interface ContestChatContext extends BaseChatContext {
  type: 'contest';
  contestId: number | string;
  currentProblemTitle?: string;
}

export interface SubmissionChatContext extends BaseChatContext {
  type: 'submission';
  submissionId: number | string;
  problemTitle: string;
  status: string;
  language: string;
}

export type ChatContext =
  | ProblemChatContext
  | CourseChatContext
  | LessonChatContext
  | ContestChatContext
  | SubmissionChatContext;
