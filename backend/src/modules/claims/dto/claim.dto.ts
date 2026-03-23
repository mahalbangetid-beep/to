import {
  IsString, IsOptional, IsUUID, IsArray, IsEnum,
} from 'class-validator';

export class CreateClaimDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsUUID()
  orderItemId?: string;

  @IsString()
  @IsEnum(['replacement', 'error', 'not_received'])
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  proofUrls?: string[];
}

export class ResolveClaimDto {
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
