
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // GET USER PROFILE
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // UPDATE USER PROFILE
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ) {
    if (!dto.name && !dto.email) {
      throw new BadRequestException(
        'At least one field is required',
      );
    }

    const user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (
        existingUser &&
        existingUser.userId !== userId
      ) {
        throw new ConflictException(
          'Email already registered',
        );
      }

      user.email = email;
    }

    if (dto.name) {
      user.name = dto.name.trim();
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'Profile updated successfully',
      user: {
        userId: updatedUser.userId,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }

  // CHANGE PASSWORD
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.userId = :userId', { userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      dto.currentPassword,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    user.passwordHash = await argon2.hash(
      dto.newPassword,
    );

    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }
}
