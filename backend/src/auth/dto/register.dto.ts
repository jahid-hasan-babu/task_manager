import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' }) // bcrypt limit
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100)
  name: string;

  @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
  @IsOptional()
  role?: Role;
}
