
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReturnStatus } from '../entities/return.entity';

export class UpdateReturnStatusDto {
  @IsEnum(ReturnStatus)
  status!: ReturnStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}
