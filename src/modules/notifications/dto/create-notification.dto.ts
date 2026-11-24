
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;
}
