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
  CoursesCreateCourseBody,
  MaterialsCreateMaterialBody,
  TCoursesCreateCourseData,
  TCoursesGetCourseData,
  TCoursesGetCoursesData,
  TMaterialsCreateMaterialData,
  TMaterialsGetMaterialData,
  TMaterialsGetMaterialsData,
  UserRole,
} from '@pcs/shared-data-access';
import { Request } from 'express';
import { UserAuth } from 'src/modules/auth/decorators/user-auth.decorator';
import { CoursesService } from './courses.service';

const CourseIdParam = Param(
  'courseId',
  new ParseUUIDPipe({
    exceptionFactory: () => new NotFoundException('Course not found'),
  }),
);
const MaterialIdParam = Param(
  'materialId',
  new ParseUUIDPipe({
    exceptionFactory: () => new NotFoundException('Material not found'),
  }),
);

@Controller('courses')
@UserAuth({ roles: [UserRole.Instructor] })
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses(@Req() req: Request): Promise<TCoursesGetCoursesData> {
    return this.coursesService.getCourses({ where: { instructorId: req.user!.id } });
  }

  @Get(':courseId')
  async getCourse(
    @CourseIdParam courseId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetCourseData> {
    const course = await this.coursesService.getCourse(courseId, {
      where: { instructorId: req.user!.id },
    });

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
    return this.coursesService.createCourse(dto, req.user!.id);
  }

  @Get(':courseId/materials')
  async getCourseMaterials(
    @CourseIdParam courseId: string,
    @Req() req: Request,
  ): Promise<TMaterialsGetMaterialsData> {
    return this.coursesService.getCourseMaterials(courseId, {
      where: { creatorInstructorId: req.user!.id },
    });
  }

  @Get(':courseId/materials/:materialId')
  async getCourseMaterial(
    @CourseIdParam courseId: string,
    @MaterialIdParam materialId: string,
    @Req() req: Request,
  ): Promise<TMaterialsGetMaterialData> {
    const material = await this.coursesService.getCourseMaterial(courseId, materialId, {
      where: { creatorInstructorId: req.user!.id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  @Post(':courseId/materials')
  createCourseMaterial(
    @CourseIdParam courseId: string,
    @Body() dto: MaterialsCreateMaterialBody,
    @Req() req: Request,
  ): Promise<TMaterialsCreateMaterialData> {
    return this.coursesService.createCourseMaterial(dto, courseId, req.user!.id);
  }
}
