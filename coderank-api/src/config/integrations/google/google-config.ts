import { registerAs } from "@nestjs/config";

export default registerAs('googleConfig', () => ({
  clientId: process.env.INTEGRATIONS_GOOGLE_CLIENT_ID,
  clientSecret: process.env.INTEGRATIONS_GOOGLE_CLIENT_SECRET
}))

