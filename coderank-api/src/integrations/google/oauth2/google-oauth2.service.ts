import { Injectable } from '@nestjs/common';
import { google, Auth } from 'googleapis';
import { GoogleConfigService } from '../../../config/integrations/google/google-config.service';

@Injectable()
export class GoogleOauth2Service {
  private oAuth2Client: Auth.JWT;

  constructor(private readonly googleConfigService: GoogleConfigService) {
    this.oAuth2Client = new google.auth.JWT({
      email: this.googleConfigService.oauth2ClientEmail,
      key: this.googleConfigService.oauth2PrivateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
  }

  getAuthenticatedClient() {
    return this.oAuth2Client;
  }
}