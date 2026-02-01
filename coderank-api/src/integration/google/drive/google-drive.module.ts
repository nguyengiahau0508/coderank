import { Module } from "@nestjs/common";
import { GoogleDriveService } from "./google-drive.service";
import { GoogleOauth2Module } from "../oauth2/google-oauth2.module";
import { GoogleConfigModule } from "src/config/integrations/google/google-config.module";

@Module({
  imports: [
    GoogleOauth2Module,
    GoogleConfigModule,
  ],
  exports: [GoogleDriveService],
  providers: [GoogleDriveService]
})
export class GoogleDriveModule { }