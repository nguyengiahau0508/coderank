import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  accessSecret: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET,
  refreshSecret: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET,
  accessExpiresIn: process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN,
  refreshExpiresIn: process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN,
  emailVerificationSecret: process.env.AUTH_JWT_EMAIL_VERIFICATION_TOKEN_SECRET,
  emailVerificationExpiresIn:
    process.env.AUTH_JWT_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
  passwordResetSecret: process.env.AUTH_JWT_PASSWORD_RESET_TOKEN_SECRET,
  passwordResetExpiresIn: process.env.AUTH_JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN,
}));
