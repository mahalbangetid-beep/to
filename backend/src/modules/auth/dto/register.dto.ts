import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(50, { message: 'Password maksimal 50 karakter' })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Nomor HP maksimal 20 karakter' })
  phone?: string;
}
