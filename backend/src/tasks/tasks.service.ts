import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, teacherId: string) {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        creator: {
          connect: { id: teacherId },
        },
      },
      include: {
        creator: true,
        submissions: true,
        students: true,
      },
    });
  }

  async findAllByTeacher(teacherId: string) {
    return this.prisma.task.findMany({
      where: {
        creatorId: teacherId,
      },
      include: {
        creator: true,
        submissions: true,
        students: true,
      },
    });
  }

  async findAllByStudent(studentId: string) {
    return this.prisma.task.findMany({
      where: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
      include: {
        creator: true,
        submissions: {
          where: {
            studentId: studentId,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        creator: true,
        submissions: true,
        students: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    return task;
  }

  async remove(id: string, teacherId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!task) {
      throw new NotFoundException('Задание не найдено');
    }

    if (task.creatorId !== teacherId) {
      throw new ForbiddenException('У вас нет прав на удаление этого задания');
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto,
    studentId: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: createSubmissionDto.taskId },
      include: { students: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.students.some((student) => student.id === studentId)) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.prisma.submission.create({
      data: {
        answer: createSubmissionDto.answer,
        taskId: createSubmissionDto.taskId,
        studentId,
      },
      include: {
        student: true,
        task: true,
      },
    });
  }

  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback: string,
    teacherId: string,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.task.creatorId !== teacherId) {
      throw new ForbiddenException(
        'You can only grade submissions for your own tasks',
      );
    }

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
      },
      include: {
        student: true,
        task: true,
      },
    });
  }
}
