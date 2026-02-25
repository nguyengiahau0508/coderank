import { Global, Module } from "@nestjs/common";
import { GoogleOauth2Module } from "./google/oauth2/google-oauth2.module";
import { GoogleDriveModule } from "./google/drive/google-drive.module";

@Global()
@Module({
    imports: [
        GoogleOauth2Module,
        GoogleDriveModule
    ],
    exports: [
        GoogleOauth2Module,
        GoogleDriveModule
    ]
})
export class RootIntegrationModule {}