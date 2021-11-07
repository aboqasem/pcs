import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import {
  CoursesCreateOwnCourseBody,
  CoursesCreateOwnCourseData,
  CoursesGetOwnCourseData,
  CoursesGetOwnCoursesData,
  UserRole,
} from '@pcs/shared-data-access';
import { Request } from 'express';
import { UserAuth } from 'src/modules/auth/decorators/user-auth.decorator';
import { CoursesService } from './courses.service';

@Controller('courses')
@UserAuth({ roles: [UserRole.Instructor] })
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getOwnCourses(): Promise<CoursesGetOwnCoursesData> {
    return this.coursesService.getCourses();
  }

  @Get(':courseId')
  async getOwnCourse(
    @Param(
      'courseId',
      new ParseUUIDPipe({
        exceptionFactory: () => new NotFoundException('Course not found'),
      }),
    )
    courseId: string,
    @Req() req: Request,
  ): Promise<CoursesGetOwnCourseData> {
    const course = await this.coursesService.getCourse(courseId, {
      where: { instructorId: req.user!.id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  @Post()
  createOwnCourse(
    @Body() dto: CoursesCreateOwnCourseBody,
    @Req() req: Request,
  ): Promise<CoursesCreateOwnCourseData> {
    return this.coursesService.createCourse(dto, req.user!.id);
  }
}
