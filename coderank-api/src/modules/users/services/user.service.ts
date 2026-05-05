import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { UsersEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UsersService extends BaseService<UsersEntity> {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {
    super(userRepository);
  }

  async getProfileById(userId: string): Promise<UsersEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.email')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async updateProfileById(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UsersEntity> {
    const profile = await this.getProfileById(userId);
    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const fullName = dto.fullName ?? dto.name;
    const avatarUrl = dto.avatarUrl ?? dto.avatar;

    if (fullName !== undefined) {
      profile.fullName = fullName;
    }
    if (dto.username !== undefined) {
      profile.username = dto.username;
    }
    if (dto.email !== undefined) {
      profile.email = dto.email;
    }
    if (avatarUrl !== undefined) {
      profile.avatarUrl = avatarUrl;
    }
    if (dto.phoneNumber !== undefined) {
      profile.phoneNumber = dto.phoneNumber;
    }
    if (dto.address !== undefined) {
      profile.address = dto.address;
    }
    if (dto.birthday !== undefined) {
      profile.birthday = dto.birthday;
    }
    if (dto.gender !== undefined) {
      profile.gender = dto.gender;
    }

    await this.userRepository.save(profile);
    const updated = await this.getProfileById(userId);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }
}
