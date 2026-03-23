import {
  IsString, IsOptional, IsUUID, IsArray, MaxLength, IsEnum,
} from 'class-validator';

export class CreateTicketDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string; // 'payment' | 'product' | 'error' | 'other'

  @IsString()
  @MaxLength(255)
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}

export class ReplyTicketDto {
  @IsString()
  message: string;
}

export class UpdateTicketStatusDto {
  @IsString()
  @IsEnum(['open', 'processing', 'resolved', 'closed'])
  status: string;
}
