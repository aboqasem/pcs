import { Body, Controller, Get, NotFoundException, Post, Req } from '@nestjs/common';
import {
  CoursesCreateCourseBody,
  CoursesCreateMaterialBody,
  TCoursesCreateCourseData,
  TCoursesCreateMaterialData,
  TCoursesGetCourseData,
  TCoursesGetCoursesData,
  TCoursesGetMaterialData,
  TCoursesGetMaterialsData,
  UserRole,
} from '@pcs/shared-data-access';
import { Request } from 'express';
import { UserAuth } from 'src/modules/auth/decorators/user-auth.decorator';
import { CourseIdParam } from 'src/modules/courses/decorators/course-id-param.decorator';
import { MaterialIdParam } from 'src/modules/materials/decorators/material-id-param.decorator';
import { MaterialsService } from 'src/modules/materials/materials.service';
import { CoursesService } from './courses.service';

@Controller('courses')
@UserAuth({ roles: [UserRole.Instructor] })
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly materialsService: MaterialsService,
  ) {}

  @Get()
  async getCourses(@Req() req: Request): Promise<TCoursesGetCoursesData> {
    return this.coursesService.getInstructorCourses(req.user!.id);
  }

  @Get(':courseId')
  async getCourse(
    @CourseIdParam() courseId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetCourseData> {
    const course = await this.coursesService.getInstructorCourse(req.user!.id, courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  @Post()
  createCourse(
    @Body() dto: CoursesCreateCourseBody,
    @Req() req: Request,
  ): Promise<TCoursesCreateCourseData> {
    return this.coursesService.createInstructorCourse(req.user!.id, dto);
  }

  @Get(':courseId/materials')
  async getCourseMaterials(
    @CourseIdParam() courseId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetMaterialsData> {
    return this.materialsService.getInstructorCourseMaterials(req.user!.id, courseId);
  }

  @Get(':courseId/materials/:materialId')
  async getCourseMaterial(
    @CourseIdParam() courseId: string,
    @MaterialIdParam() materialId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetMaterialData> {
    const material = await this.materialsService.getInstructorCourseMaterial(
      req.user!.id,
      courseId,
      materialId,
    );

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  @Post(':courseId/materials')
  createCourseMaterial(
    @CourseIdParam() courseId: string,
    @Body() dto: CoursesCreateMaterialBody,
    @Req() req: Request,
  ): Promise<TCoursesCreateMaterialData> {
    return this.materialsService.createInstructorCourseMaterial(req.user!.id, courseId, dto);
  }
}
