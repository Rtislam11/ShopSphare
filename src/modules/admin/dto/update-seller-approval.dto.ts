import { IsEnum } from 'class-validator';
import { SellerStatus } from '../../sellers/entities/seller.entity';

export class UpdateSellerApprovalDto {
  @IsEnum([SellerStatus.APPROVED, SellerStatus.REJECTED])
  status!: SellerStatus;
}