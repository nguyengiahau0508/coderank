import { Module } from '@nestjs/common';
import { PermissionPolicyService } from './permission-policy.service';

@Module({
  providers: [PermissionPolicyService],
  exports: [PermissionPolicyService],
})
export class PermissionsModule {}
