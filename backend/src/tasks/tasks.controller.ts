import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.TEACHER)
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  findAll(@Request() req, @Query('created') created: string) {
    if (req.user.role === UserRole.TEACHER) {
      if (created === 'true') {
        return this.tasksService.findAllByTeacher(req.user.id);
      }
      return this.tasksService.findAllByTeacher(req.user.id);
    }
    return this.tasksService.findAllByStudent(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.TEACHER)
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Post('submission')
  @Roles(UserRole.STUDENT)
  createSubmission(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @Request() req,
  ) {
    return this.tasksService.createSubmission(createSubmissionDto, req.user.id);
  }

  @Get('submission/student')
  @Roles(UserRole.STUDENT)
  getStudentSubmissions(@Request() req) {
    return this.tasksService.getStudentSubmissions(req.user.id);
  }

  @Get('submission/teacher')
  @Roles(UserRole.TEACHER)
  getTeacherSubmissions(@Request() req) {
    return this.tasksService.getTeacherSubmissions(req.user.id);
  }

  @Post('submission/:id/grade')
  @Roles(UserRole.TEACHER)
  gradeSubmission(
    @Param('id') id: string,
    @Body() gradeData: { score: number; feedback: string },
    @Request() req,
  ) {
    return this.tasksService.gradeSubmission(
      id,
      gradeData.score,
      gradeData.feedback,
      req.user.id,
    );
  }
}
