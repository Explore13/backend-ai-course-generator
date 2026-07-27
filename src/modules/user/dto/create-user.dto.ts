import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @IsString({ message: 'clerk_id must be a string' })
  @IsNotEmpty({ message: 'clerk_id can not be null' })
  clerk_id!: string;

  @IsString({ message: 'first_name must be a string' })
  @IsOptional()
  first_name?: string;

  @IsString({ message: 'last_name must be a string' })
  @IsOptional()
  last_name?: string;

  @IsString({ message: 'image_url must be a string' })
  @IsOptional()
  image_url?: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'phone_number must be a string' })
  @IsOptional()
  phone_number?: string;

  @IsEnum(Role, { message: 'role must be a valid role' })
  @IsOptional()
  role?: Role;
}
