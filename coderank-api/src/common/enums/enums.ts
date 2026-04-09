export enum ProgrammingLanguageEnum {
  JavaScript = 'javascript',
  TypeScript = 'typescript',
  Python = 'python',
  Java = 'java',
  CPlusPlus = 'cpp',
  C = 'c',
  Go = 'go',
  Rust = 'rust',
}

export enum SubmissionStatusEnum {
  Pending = 'pending',
  Running = 'running',
  Accepted = 'accepted',
  WrongAnswer = 'wrong_answer',
  TimeLimitExceeded = 'time_limit_exceeded',
  MemoryLimitExceeded = 'memory_limit_exceeded',
  RuntimeError = 'runtime_error',
  CompilationError = 'compilation_error',
  SystemError = 'system_error',
}

export enum AuthProvidersEnum {
  Google = 'google',
  Github = 'github',
  Local = 'local',
  Jwt = 'jwt',
}

export enum GenderEnum {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum RolesEnum {
  Admin = 'admin',
  Student = 'student',
  Instructor = 'instructor',
  ProblemSetter = 'problem_setter',
}

export enum DifficultyEnum {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum SessionStatusEnum {
  Active = 'active',
  Expired = 'expired',
  Revoked = 'revoked',
}

export enum TokenTypeEnum {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'reset_password',
  EMAIL_VERIFICATION = 'email_verification',
}

export enum TestcaseCompareTypeEnum {
  Exact = 'exact',
  TrimWhitespace = 'trim_whitespace',
  Tokenize = 'tokenize',
}

export enum ContestStatusEnum {
  Draft = 'draft',
  Upcoming = 'upcoming',
  Running = 'running',
  Ended = 'ended',
}

// ===== COURSE ENUMS =====

export enum CourseLevelEnum {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export enum CourseStatusEnum {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum LessonTypeEnum {
  Video = 'video',
  Text = 'text',
  Quiz = 'quiz',
  Practice = 'practice',
}

export enum EnrollmentStatusEnum {
  Active = 'active',
  Completed = 'completed',
  Dropped = 'dropped',
  Suspended = 'suspended',
}

export enum QuizQuestionTypeEnum {
  MultipleChoice = 'multiple_choice',
  TrueFalse = 'true_false',
  ShortAnswer = 'short_answer',
  Code = 'code',
}

// ===== AI ENUMS =====

export enum AiProviderEnum {
  Gemini = 'gemini',
  OpenAI = 'openai',
  Anthropic = 'anthropic',
  Ollama = 'ollama',
  Groq = 'groq',
}

export enum AiHintLevelEnum {
  Approach = 'approach', // Level 1: General approach
  Algorithm = 'algorithm', // Level 2: Specific algorithm
  Pseudocode = 'pseudocode', // Level 3: Step-by-step pseudocode
  PartialCode = 'partial_code', // Level 4: Partial code snippet
}

export enum CodeReviewSeverityEnum {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export enum CodeReviewStatusEnum {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}
