import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokensEntity } from '../entities/token.entity';
import { BaseService } from 'src/common/services/base.service';
import { CreateTokenDto } from '../dto/token/create-token.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtConfigService } from 'src/config/auth/jwt/jwt-config.service';
import { TokenTypeEnum } from 'src/common/enums/enums';
import * as crypto from 'crypto';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class TokensService extends BaseService<TokensEntity> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtConfigService: JwtConfigService,
    @InjectRepository(TokensEntity) private readonly tokenRepository: Repository<TokensEntity>
  ) { 
    super(tokenRepository);
  }

  async generateToken(dto: CreateTokenDto): Promise<string> {
    let tokenString: string;
    const payload = dto.payload;
    switch (dto.type) {
      case TokenTypeEnum.ACCESS: {
        tokenString = await this.jwtService.signAsync(
          payload,
          {
            secret: this.jwtConfigService.accessSecret,
            expiresIn: this.jwtConfigService.accessExpiresIn as any,
          }
        );
        break;
      }
      case TokenTypeEnum.REFRESH: {
        tokenString = await this.jwtService.signAsync(
          payload,
          {
            secret: this.jwtConfigService.refreshSecret,
            expiresIn: this.jwtConfigService.refreshExpiresIn as any,
          }
        );
        break;
      }
      case TokenTypeEnum.EMAIL_VERIFICATION: {
        tokenString = await this.jwtService.signAsync(
          payload,
          {
            secret: this.jwtConfigService.emailVerificationSecret,
            expiresIn: this.jwtConfigService.emailVerificationExpiresIn as any,
          }
        );
        break;
      }
      case TokenTypeEnum.RESET_PASSWORD: {
        tokenString = await this.jwtService.signAsync(
          payload,
          {
            secret: this.jwtConfigService.passwordResetSecret,
            expiresIn: this.jwtConfigService.passwordResetExpiresIn as any,
          }
        );
        break;
      }
      default:
        throw new Error(`Unsupported token type: ${dto.type}`);
    }

    // Hash the token for storage
    const tokenHash = this.hashToken(tokenString);

    // Save token record to database
    const tokenEntity = this.tokenRepository.create({
      userId: dto.userId,
      tokenHash,
      type: dto.type,
      expiresAt: dto.expiresAt as any,
      isRevoked: false,
    });

    await this.tokenRepository.save(tokenEntity);

    return tokenString;
  }

  async verifyToken(token: string, type: TokenTypeEnum): Promise<IJwtPayload> {
    let secret: string;

    switch (type) {
      case TokenTypeEnum.ACCESS:
        secret = this.jwtConfigService.accessSecret;
        break;
      case TokenTypeEnum.REFRESH:
        secret = this.jwtConfigService.refreshSecret;
        break;
      case TokenTypeEnum.EMAIL_VERIFICATION:
        secret = this.jwtConfigService.emailVerificationSecret;
        break;
      case TokenTypeEnum.RESET_PASSWORD:
        secret = this.jwtConfigService.passwordResetSecret;
        break;
      default:
        throw new Error(`Unsupported token type: ${type}`);
    }

    try {
      // Verify JWT signature and expiration
      const payload: IJwtPayload = await this.jwtService.verifyAsync(token, { secret });

      // Check if token is revoked in database
      const tokenHash = this.hashToken(token);
      const tokenEntity = await this.tokenRepository.findOne({
        where: { tokenHash, type },
      });

      if (!tokenEntity) {
        throw new Error('Token not found in database');
      }

      if (tokenEntity.isRevoked) {
        throw new Error('Token has been revoked');
      }

      return payload;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  async revokeToken(token: string, type: TokenTypeEnum): Promise<boolean> {
    try {
      const tokenHash = this.hashToken(token);
      
      const result = await this.tokenRepository.update(
        { tokenHash, type },
        { isRevoked: true }
      );

      return (result.affected ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to revoke token: ${error.message}`);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const result = await this.tokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true }
      );

      return result.affected || 0;
    } catch (error) {
      throw new Error(`Failed to revoke user tokens: ${error.message}`);
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}