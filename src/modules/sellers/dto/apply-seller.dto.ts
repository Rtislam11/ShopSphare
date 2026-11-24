import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ApplySellerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  businessName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  businessDescription?: string;

  @IsEmail()
  @MaxLength(150)
  businessEmail!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  businessPhone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  businessAddress!: string;
}