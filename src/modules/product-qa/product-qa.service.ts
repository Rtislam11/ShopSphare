
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import {
  ProductQuestion,
  ProductQuestionStatus,
} from './entities/product-question.entity';

import { ProductAnswer } from './entities/product-answer.entity';
import { ProductAnswerVote } from './entities/product-answer-vote.entity';
import { Product } from '../products/entities/product.entity';

import { CreateProductQuestionDto } from './dto/create-product-question.dto';
import { CreateProductAnswerDto } from './dto/create-product-answer.dto';
import { ModerateProductQuestionDto } from './dto/moderate-product-question.dto';

@Injectable()
export class ProductQaService {
  constructor(
    @InjectRepository(ProductQuestion)
    private readonly questionRepository: Repository<ProductQuestion>,

    @InjectRepository(ProductAnswer)
    private readonly answerRepository: Repository<ProductAnswer>,

    @InjectRepository(ProductAnswerVote)
    private readonly voteRepository: Repository<ProductAnswerVote>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly dataSource: DataSource,
  ) {}


  async createQuestion(
    productId: string,
    userId: string,
    dto: CreateProductQuestionDto,
  ) {
    const product = await this.productRepository.findOne({
      where: { productId, status: 'ACTIVE' as any },
    });

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    const question = this.questionRepository.create({
      productId,
      userId,
      question: dto.question,
      status: ProductQuestionStatus.PENDING,
    });

    return this.questionRepository.save(question);
  }


  async getProductQuestions(productId: string) {
    const product = await this.productRepository.findOne({
      where: { productId, status: 'ACTIVE' as any },
    });

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    return this.questionRepository.find({
      where: {
        productId,
        status: ProductQuestionStatus.APPROVED,
      },
      relations: ['user', 'answers', 'answers.user'],
      order: { createdAt: 'DESC' },
    });
  }


  async getQuestionById(questionId: string) {
    const question = await this.questionRepository.findOne({
      where: {
        questionId,
        status: ProductQuestionStatus.APPROVED,
      },
      relations: ['product', 'user', 'answers', 'answers.user'],
    });

    if (!question) {
      throw new NotFoundException('Product question not found');
    }

    return question;
  }


  async createAnswer(
    questionId: string,
    sellerUserId: string,
    dto: CreateProductAnswerDto,
  ) {
    const question = await this.questionRepository.findOne({
      where: {
        questionId,
        status: ProductQuestionStatus.APPROVED,
      },
      relations: ['product', 'product.seller'],
    });

    if (!question) {
      throw new NotFoundException('Approved question not found');
    }

    if (question.product.seller?.userId !== sellerUserId) {
      throw new ForbiddenException(
        'Only the product owner can answer this question',
      );
    }

    const answer = this.answerRepository.create({
      questionId,
      userId: sellerUserId,
      answer: dto.answer,
    });

    return this.answerRepository.save(answer);
  }

  async updateAnswer(
    answerId: string,
    userId: string,
    dto: CreateProductAnswerDto,
  ) {
    const answer = await this.answerRepository.findOne({
      where: { answerId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.userId !== userId) {
      throw new ForbiddenException('You cannot edit this answer');
    }

    answer.answer = dto.answer;

    return this.answerRepository.save(answer);
  }

  async deleteQuestion(questionId: string, userId: string) {
    const question = await this.questionRepository.findOne({
      where: { questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('You cannot delete this question');
    }

    await this.questionRepository.remove(question);

    return { message: 'Question deleted successfully' };
  }

  async deleteAnswer(answerId: string, userId: string) {
    const answer = await this.answerRepository.findOne({
      where: { answerId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.userId !== userId) {
      throw new ForbiddenException('You cannot delete this answer');
    }

    await this.answerRepository.remove(answer);

    return { message: 'Answer deleted successfully' };
  }

  

async moderateQuestion(
  questionId: string,
  dto: ModerateProductQuestionDto,
) {
  const question = await this.questionRepository.findOne({
    where: { questionId },
  });

  if (!question) {
    throw new NotFoundException('Question not found');
  }

  question.status = dto.status;
  question.moderationNote = dto.moderationNote ?? null;

  return this.questionRepository.save(question);
}


  async markAnswerHelpful(answerId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const answer = await manager
        .createQueryBuilder(ProductAnswer, 'answer')
        .setLock('pessimistic_write')
        .where('answer.answerId = :answerId', { answerId })
        .getOne();

      if (!answer) {
        throw new NotFoundException('Answer not found');
      }

      if (answer.userId === userId) {
        throw new ForbiddenException(
          'You cannot mark your own answer as helpful',
        );
      }

      const existingVote = await manager.findOne(ProductAnswerVote, {
        where: { answerId, userId },
      });

      if (existingVote) {
        throw new ConflictException(
          'You have already marked this answer helpful',
        );
      }

      const vote = manager.create(ProductAnswerVote, {
        answerId,
        userId,
      });

      await manager.save(ProductAnswerVote, vote);

      answer.helpfulCount += 1;

      await manager.save(ProductAnswer, answer);

      return {
        message: 'Answer marked as helpful',
        helpfulCount: answer.helpfulCount,
      };
    });
  }
}
