import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators';
import type { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UsersService } from './services/user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersEntity } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  async getProfile(
    @CurrentUser() currentUser: IJwtPayload,
  ): Promise<UsersEntity> {
    const profile = await this.usersService.getProfileById(currentUser.userId);
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return profile;
  }

  @Patch('profile')
  @ApiBearerAuth('JWT-auth')
  async updateProfile(
    @CurrentUser() currentUser: IJwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UsersEntity> {
    return this.usersService.updateProfileById(currentUser.userId, dto);
  }
}
