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
