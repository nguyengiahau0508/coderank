import { Global, Module } from "@nestjs/common";
import { GoogleOauth2Module } from "./google/oauth2/google-oauth2.module";
import { GoogleDriveModule } from "./google/drive/google-drive.module";
import { LocalStorageModule } from "./local-storage/local-storage.module";

@Global()
@Module({
    imports: [
        GoogleOauth2Module,
        GoogleDriveModule,
        LocalStorageModule,
    ],
    exports: [
        GoogleOauth2Module,
        GoogleDriveModule,
        LocalStorageModule,
    ]
})
export class RootIntegrationModule {}