import {
  IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsDateString,
  MaxLength, Min, IsEnum,
} from 'class-validator';

export class CreatePromoDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsEnum(['percentage', 'fixed'])
  discountType: string;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  perUserLimit?: number;

  @IsOptional()
  @IsArray()
  applicableProducts?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidatePromoDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  cartTotal: number;

  @IsOptional()
  @IsArray()
  productIds?: string[];
}
