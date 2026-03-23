import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  name: 'default', // Added name property
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'tokdig'),
  password: configService.get<string>('DB_PASSWORD', 'tokdig_dev_2026'),
  database: configService.get<string>('DB_DATABASE', 'tokdig'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Changed from configService.get<string>('NODE_ENV') === 'development'
  logging: false, // Changed from configService.get<string>('NODE_ENV') === 'development'
});
