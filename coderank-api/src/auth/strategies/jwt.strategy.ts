import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtConfigService } from 'src/config/auth/jwt/jwt-config.service';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { UsersService } from 'src/modules/users/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtConfigService: JwtConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfigService.accessSecret,
    });
  }

  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    const user = await this.usersService.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or inactive user');
    }
    return { userId: payload.userId, roles: payload.roles };
  }
}
