import { ConfigService } from '@nestjs/config';

export interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export const getMidtransConfig = (configService: ConfigService): MidtransConfig => ({
  serverKey: configService.get<string>('MIDTRANS_SERVER_KEY', ''),
  clientKey: configService.get<string>('MIDTRANS_CLIENT_KEY', ''),
  isProduction: configService.get<string>('MIDTRANS_IS_PRODUCTION', 'false') === 'true',
});
