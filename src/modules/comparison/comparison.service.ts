
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Offer, OfferStatus } from '../offers/entities/offer.entity';
import { SellerStatus } from '../sellers/entities/seller.entity';
import { ProductStatus } from '../products/entities/product.entity';

import { RankOffersDto } from './dto/rank-offers.dto';
import { UncertaintyDto } from './dto/uncertainty.dto';
import { SensitivityDto } from './dto/sensitivity.dto';
import { RankingWeights } from './interfaces/ranking-weights.interface';

type OfferScores = {
  offerId: string;
  sellerId: string;
  sellerName: string;
  title: string;
  originalPrice: number;
  discountPercentage: number;
  effectivePrice: number;
  reliability: number;
  availableStock: number;
  scores: RankingWeights;
};

@Injectable()
export class ComparisonService {
  private readonly defaultWeights: RankingWeights = {
    price: 40,
    reliability: 30,
    discount: 20,
    stock: 10,
  };

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
  ) {}

  private async getComparisonData(
    productId: string,
  ): Promise<OfferScores[]> {
    const offers = await this.offerRepository.find({
      where: {
        productId,
        status: OfferStatus.ACTIVE,
      },
      relations: {
        seller: true,
        product: true,
      },
    });

    const now = new Date();

    const validOffers = offers.filter((offer) => {
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);

      return (
        startDate <= now &&
        endDate >= now &&
        offer.seller?.status === SellerStatus.APPROVED &&
        offer.product?.status === ProductStatus.ACTIVE &&
        Number(offer.stockQuantity) > 0 &&
        Number(offer.product.stockQuantity) > 0
      );
    });

    if (validOffers.length === 0) {
      throw new NotFoundException(
        'No active offers are available for this product',
      );
    }

    const prepared = validOffers.map((offer) => {
      const originalPrice = Number(offer.product.price);
      const discountPercentage = Number(offer.discountPercentage);
      const effectivePrice =
        originalPrice * (1 - discountPercentage / 100);

      const availableStock = Math.min(
        Number(offer.stockQuantity),
        Number(offer.product.stockQuantity),
      );

      return {
        offerId: offer.offerId,
        sellerId: offer.seller.sellerId,
        sellerName: offer.seller.businessName,
        title: offer.title,
        originalPrice,
        discountPercentage,
        effectivePrice,
        reliability: Math.max(
          0,
          Math.min(100, Number(offer.seller.reliabilityScore)),
        ),
        availableStock,
      };
    });

    const prices = prepared.map((item) => item.effectivePrice);
    const stocks = prepared.map((item) => item.availableStock);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxStock = Math.max(...stocks);

    return prepared.map((item) => ({
      ...item,
      scores: {
        price:
          maxPrice === minPrice
            ? 100
            : ((maxPrice - item.effectivePrice) /
                (maxPrice - minPrice)) *
              100,
        reliability: item.reliability,
        discount: item.discountPercentage,
        stock:
          maxStock === 0
            ? 0
            : (item.availableStock / maxStock) * 100,
      },
    }));
  }

  private getWeights(
    dto?: RankOffersDto | SensitivityDto,
  ): RankingWeights {
    const weights: RankingWeights = {
      price: dto?.priceWeight ?? this.defaultWeights.price,
      reliability:
        dto?.reliabilityWeight ?? this.defaultWeights.reliability,
      discount: dto?.discountWeight ?? this.defaultWeights.discount,
      stock: dto?.stockWeight ?? this.defaultWeights.stock,
    };

    const total =
      weights.price +
      weights.reliability +
      weights.discount +
      weights.stock;

    if (total <= 0) {
      throw new BadRequestException(
        'At least one ranking weight must be greater than zero',
      );
    }

    return weights;
  }

  private calculateScore(
    scores: RankingWeights,
    weights: RankingWeights,
  ): number {
    const totalWeight =
      weights.price +
      weights.reliability +
      weights.discount +
      weights.stock;

    const weightedTotal =
      scores.price * weights.price +
      scores.reliability * weights.reliability +
      scores.discount * weights.discount +
      scores.stock * weights.stock;

    return Number((weightedTotal / totalWeight).toFixed(2));
  }

  private rankOffers(
    offers: OfferScores[],
    weights: RankingWeights,
  ) {
    return offers
      .map((offer) => ({
        ...offer,
        finalScore: this.calculateScore(offer.scores, weights),
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .map((offer, index) => ({
        ...offer,
        rank: index + 1,
      }));
  }


  async compareOffers(productId: string) {
    const offers = await this.getComparisonData(productId);

    return {
      productId,
      totalOffers: offers.length,
      offers: offers.map((offer) => ({
        ...offer,
        finalPrice: Number(offer.effectivePrice.toFixed(2)),
      })),
    };
  }

  
  async rankProductOffers(
    productId: string,
    dto: RankOffersDto,
  ) {
    const offers = await this.getComparisonData(productId);
    const weights = this.getWeights(dto);

    return {
      productId,
      weights,
      ranking: this.rankOffers(offers, weights),
    };
  }

 
  async calculateUncertainty(
    productId: string,
    dto: UncertaintyDto,
  ) {
    const offers = await this.getComparisonData(productId);
    const weights = this.defaultWeights;

    const uncertainty: RankingWeights = {
      price: dto.priceUncertainty ?? 0,
      reliability: dto.reliabilityUncertainty ?? 0,
      discount: dto.discountUncertainty ?? 0,
      stock: dto.stockUncertainty ?? 0,
    };

    const results = offers
      .map((offer) => {
        const lowerScores: RankingWeights = {
          price: Math.max(
            0,
            offer.scores.price * (1 - uncertainty.price / 100),
          ),
          reliability: Math.max(
            0,
            offer.scores.reliability *
              (1 - uncertainty.reliability / 100),
          ),
          discount: Math.max(
            0,
            offer.scores.discount * (1 - uncertainty.discount / 100),
          ),
          stock: Math.max(
            0,
            offer.scores.stock * (1 - uncertainty.stock / 100),
          ),
        };

        const upperScores: RankingWeights = {
          price: Math.min(
            100,
            offer.scores.price * (1 + uncertainty.price / 100),
          ),
          reliability: Math.min(
            100,
            offer.scores.reliability *
              (1 + uncertainty.reliability / 100),
          ),
          discount: Math.min(
            100,
            offer.scores.discount * (1 + uncertainty.discount / 100),
          ),
          stock: Math.min(
            100,
            offer.scores.stock * (1 + uncertainty.stock / 100),
          ),
        };

        return {
          offerId: offer.offerId,
          sellerName: offer.sellerName,
          bestCaseScore: this.calculateScore(upperScores, weights),
          worstCaseScore: this.calculateScore(lowerScores, weights),
        };
      })
      .sort((a, b) => b.bestCaseScore - a.bestCaseScore);

    return {
      productId,
      uncertaintyPercentages: uncertainty,
      results,
      explanation:
        'Scores show estimated ranges after applying uncertainty percentages to normalized criterion scores.',
    };
  }

 
  async calculateSensitivity(
    productId: string,
    dto: SensitivityDto,
  ) {
    const offers = await this.getComparisonData(productId);
    const baseWeights = this.getWeights(dto);
    const step = dto.stepPercentage ?? 10;

    const baseRanking = this.rankOffers(offers, baseWeights);

    const scenarios: {
      criterion: string;
      direction: string;
      weights: RankingWeights;
      ranking: { offerId: string; rank: number; score: number }[];
    }[] = [];

    const criteria: (keyof RankingWeights)[] = [
      'price',
      'reliability',
      'discount',
      'stock',
    ];

    for (const criterion of criteria) {
      for (const direction of ['increase', 'decrease'] as const) {
        const scenarioWeights = { ...baseWeights };

        scenarioWeights[criterion] = Math.max(
          0,
          Math.min(
            100,
            scenarioWeights[criterion] +
              (direction === 'increase' ? step : -step),
          ),
        );

        if (
          scenarioWeights.price +
            scenarioWeights.reliability +
            scenarioWeights.discount +
            scenarioWeights.stock ===
          0
        ) {
          continue;
        }

        const ranking = this.rankOffers(offers, scenarioWeights);

        scenarios.push({
          criterion,
          direction,
          weights: scenarioWeights,
          ranking: ranking.map((item) => ({
            offerId: item.offerId,
            rank: item.rank,
            score: item.finalScore,
          })),
        });
      }
    }

    const stability = baseRanking.map((base) => {
      const scenarioRanks = scenarios.flatMap((scenario) => {
        const match = scenario.ranking.find(
          (item) => item.offerId === base.offerId,
        );
        return match ? [match.rank] : [];
      });

      return {
        offerId: base.offerId,
        sellerName: base.sellerName,
        baseRank: base.rank,
        bestRank: Math.min(base.rank, ...scenarioRanks),
        worstRank: Math.max(base.rank, ...scenarioRanks),
        rankChanged: scenarioRanks.some(
          (rank) => rank !== base.rank,
        ),
      };
    });

    return {
      productId,
      baseWeights,
      stepPercentage: step,
      stability,
      scenarios,
    };
  }

  
  async getScoreBreakdown(productId: string) {
    const offers = await this.getComparisonData(productId);
    const weights = this.defaultWeights;
    const ranking = this.rankOffers(offers, weights);

    return {
      productId,
      weights,
      breakdown: ranking.map((offer) => ({
        offerId: offer.offerId,
        sellerName: offer.sellerName,
        rank: offer.rank,
        finalScore: offer.finalScore,
        criteria: {
          price: {
            score: Number(offer.scores.price.toFixed(2)),
            weight: weights.price,
            contribution: Number(
              ((offer.scores.price * weights.price) / 100).toFixed(2),
            ),
          },
          reliability: {
            score: Number(offer.scores.reliability.toFixed(2)),
            weight: weights.reliability,
            contribution: Number(
              (
                (offer.scores.reliability * weights.reliability) /
                100
              ).toFixed(2),
            ),
          },
          discount: {
            score: Number(offer.scores.discount.toFixed(2)),
            weight: weights.discount,
            contribution: Number(
              ((offer.scores.discount * weights.discount) / 100).toFixed(2),
            ),
          },
          stock: {
            score: Number(offer.scores.stock.toFixed(2)),
            weight: weights.stock,
            contribution: Number(
              ((offer.scores.stock * weights.stock) / 100).toFixed(2),
            ),
          },
        },
      })),
    };
  }
}
