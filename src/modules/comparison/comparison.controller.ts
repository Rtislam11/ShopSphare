
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';

import { ComparisonService } from './comparison.service';
import { RankOffersDto } from './dto/rank-offers.dto';
import { UncertaintyDto } from './dto/uncertainty.dto';
import { SensitivityDto } from './dto/sensitivity.dto';

@Controller('comparison')
export class ComparisonController {
  constructor(
    private readonly comparisonService: ComparisonService,
  ) {}


  @Get(':productId')
  compareOffers(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.comparisonService.compareOffers(productId);
  }


  @Post(':productId/rank')
  rankOffers(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: RankOffersDto,
  ) {
    return this.comparisonService.rankProductOffers(productId, dto);
  }

 
  @Post(':productId/uncertainty')
  calculateUncertainty(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UncertaintyDto,
  ) {
    return this.comparisonService.calculateUncertainty(
      productId,
      dto,
    );
  }


  @Post(':productId/sensitivity')
  calculateSensitivity(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: SensitivityDto,
  ) {
    return this.comparisonService.calculateSensitivity(
      productId,
      dto,
    );
  }


  @Get(':productId/breakdown')
  getScoreBreakdown(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.comparisonService.getScoreBreakdown(productId);
  }
}
