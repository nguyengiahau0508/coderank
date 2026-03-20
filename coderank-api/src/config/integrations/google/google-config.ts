import { registerAs } from '@nestjs/config';

export default registerAs('googleConfig', () => ({
  clientId: process.env.INTEGRATIONS_GOOGLE_CLIENT_ID,
  clientSecret: process.env.INTEGRATIONS_GOOGLE_CLIENT_SECRET,
  oauth2ClientEmail: process.env.INTEGRATIONS_GOOGLE_OAUTH2_CLIENT_EMAIL,
  oauth2PrivateKey: process.env.INTEGRATIONS_GOOGLE_OAUTH2_PRIVATE_KEY,
  oauth2RedirectUri: process.env.INTEGRATIONS_GOOGLE_OAUTH2_REDIRECT_URI,
  driveFolderId: process.env.INTEGRATIONS_GOOGLE_DRIVE_FOLDER_ID,
}));
