import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSellerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  businessDescription?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  businessEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  businessPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessAddress?: string;
}