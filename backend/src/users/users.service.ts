import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { User, Prisma, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAllStudents() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getUserStats(userId: string) {
    const user = await this.findOne(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role === UserRole.STUDENT) {
      // Get stats for student
      const completedSubmissions = await this.prisma.submission.findMany({
        where: {
          studentId: userId,
        },
        include: {
          task: true,
        },
      });

      // Calculate statistics
      const completedTasksCount = completedSubmissions.length;

      // Calculate average score if there are graded submissions
      const gradedSubmissions = completedSubmissions.filter(
        (s) => s.score !== null,
      );
      const averageScore =
        gradedSubmissions.length > 0
          ? gradedSubmissions.reduce(
              (acc, sub) => acc + (sub.score as number),
              0,
            ) / gradedSubmissions.length
          : 0;

      return {
        completedTasksCount,
        averageScore,
      };
    } else {
      // Get stats for teacher
      const createdTasksCount = await this.prisma.task.count({
        where: {
          creatorId: userId,
        },
      });

      const gradedSubmissionsCount = await this.prisma.submission.count({
        where: {
          task: {
            creatorId: userId,
          },
          score: {
            not: null,
          },
        },
      });

      return {
        createdTasksCount,
        gradedSubmissionsCount,
      };
    }
  }
}
