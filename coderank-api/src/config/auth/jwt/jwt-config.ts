import { registerAs } from "@nestjs/config";

export default registerAs('jwtConfig', () => ({
    accessSecret: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET,
    accessExpiresIn: process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiresIn: process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRES_IN
}))
