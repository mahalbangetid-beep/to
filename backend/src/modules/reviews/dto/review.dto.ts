import { IsString, IsOptional, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
