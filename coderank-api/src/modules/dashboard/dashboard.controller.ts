import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard/student')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get aggregated student dashboard data' })
  async getMyDashboard(@CurrentUser() currentUser: IJwtPayload) {
    return this.dashboardService.getStudentDashboard(currentUser.userId);
  }
}
