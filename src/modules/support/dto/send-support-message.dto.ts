
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class SendSupportMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  attachmentUrl?: string;
}
