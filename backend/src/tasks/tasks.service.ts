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
    const { studentIds, ...taskData } = createTaskDto;

    // Create task with proper connections
    return this.prisma.task.create({
      data: {
        ...taskData,
        creator: {
          connect: { id: teacherId },
        },
        // Connect students if studentIds are provided
        ...(studentIds && studentIds.length > 0
          ? {
              students: {
                connect: studentIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        creator: true,
        submissions: {
          include: {
            student: true,
          },
        },
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
        submissions: {
          include: {
            student: true,
          },
        },
        students: true,
      },
    });
  }

  async findAllByStudent(studentId: string) {
    // First get all tasks assigned to this student
    const assignedTasks = await this.prisma.task.findMany({
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
          include: {
            student: true,
          },
        },
        students: true,
      },
    });

    // Then get all public tasks
    const publicTasks = await this.prisma.task.findMany({
      where: {
        public: true,
        // Exclude tasks that are already in assignedTasks
        id: {
          notIn: assignedTasks.map((task) => task.id),
        },
      },
      include: {
        creator: true,
        submissions: {
          where: {
            studentId: studentId,
          },
          include: {
            student: true,
          },
        },
        students: true,
      },
    });

    // Combine the two sets of tasks, with assigned tasks first
    return [...assignedTasks, ...publicTasks];
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        creator: true,
        submissions: {
          include: {
            student: true,
          },
        },
        students: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async remove(id: string, teacherId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    if (task.creatorId !== teacherId) {
      throw new ForbiddenException(
        'You are not authorized to delete this task',
      );
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

    // Allow submissions if the task is public or the student is assigned
    const isAssigned = task.students.some(
      (student) => student.id === studentId,
    );
    if (!task.public && !isAssigned) {
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

  async getStudentSubmissions(studentId: string) {
    return this.prisma.submission.findMany({
      where: {
        studentId,
      },
      include: {
        task: true,
        student: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTeacherSubmissions(teacherId: string) {
    return this.prisma.submission.findMany({
      where: {
        task: {
          creatorId: teacherId,
        },
      },
      include: {
        task: true,
        student: true,
      },
      orderBy: {
        createdAt: 'desc',
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
        'You are not authorized to grade this submission',
      );
    }

    return this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
      },
      include: {
        task: true,
        student: true,
      },
    });
  }
}
