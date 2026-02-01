import { registerAs } from "@nestjs/config";

export default registerAs('githubConfig', () => ({
  clientId: process.env.INTEGRATIONS_GITHUB_CLIENT_ID,
  clientSecret: process.env.INTEGRATIONS_GITHUB_CLIENT_SECRET
}))