export enum LanguageEnum {
  CPP = 'cpp',
  PYTHON = "python",
  JAVA = "java",
  JAVASCRIPT = "javascript"
}

export enum StatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  WRONG_ANSWER = 'wrong_answer',
  TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED = 'memory_limit_exceeded',
  RUNTIME_ERROR = 'runtime_error',
  COMPILATION_ERROR = 'compilation_error'
}


export enum AuthProvidersEnum {
  Google = 'google',
  Github = 'github',
  Local = 'local',
  Jwt = 'jwt',
}

export enum GenderEnum {
  Male = "Male",
  Female = "Female",
  Other = 'Other'
}

export enum RoleEnum {
  Admin = 'admin',
  Student = 'student',
  Instructor = 'instructor',
}

export enum SessionStatusEnum {
  Active = "active",
  Expired = "expired",
  Revoked = "revoked",
}

export enum TokenTypeEnum {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "reset_password",
  EMAIL_VERIFICATION = "email_verification",
}