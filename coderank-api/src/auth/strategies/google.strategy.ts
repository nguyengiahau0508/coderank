import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthProvidersEnum } from 'src/common/enums/enums';
import { GoogleConfigService } from 'src/config/integrations/google/google-config.service';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, AuthProvidersEnum.Google) {
  constructor(private readonly googleConfigService: GoogleConfigService) {
    super({
      clientID: googleConfigService.clientId,
      clientSecret: googleConfigService.clientSecret,
      callbackURL: `http://localhost:3000/api/auth/google/callback`,
      scope: [
        'email',
        'profile',
      ],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('Google profile:', profile);
    const { name, emails, photos, _json } = profile;
    const user = {
      providerId: profile.id,
      email: emails[0].value,
      fullName: name.givenName + ' ' + name.familyName,
      picture: _json.picture,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}