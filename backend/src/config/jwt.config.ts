import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET', 'tokdig-jwt-secret'),
  signOptions: {
    expiresIn: configService.get<string>('JWT_EXPIRATION', '7d') as any,
  },
});
