import { Module } from '@nestjs/common';
import { GoogleOauth2Service } from './google-oauth2.service';
import { GoogleConfigModule } from 'src/config/integrations/google/google-config.module';

@Module({
  imports: [GoogleConfigModule],
  providers: [GoogleOauth2Service],
  exports: [GoogleOauth2Service],
})
export class GoogleOauth2Module {}
