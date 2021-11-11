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
  MaterialsCreateOwnMaterialBody,
  MaterialsCreateOwnMaterialData,
  MaterialsGetOwnMaterialData,
  MaterialsGetOwnMaterialsData,
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
  async getOwnCourses(@Req() req: Request): Promise<CoursesGetOwnCoursesData> {
    return this.coursesService.getCourses({ where: { instructorId: req.user!.id } });
  }

  @Get(':courseId')
  async getOwnCourse(
    @CourseIdParam courseId: string,
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

  @Get(':courseId/materials')
  async getOwnCourseMaterials(
    @CourseIdParam courseId: string,
    @Req() req: Request,
  ): Promise<MaterialsGetOwnMaterialsData> {
    return this.coursesService.getCourseMaterials(courseId, {
      where: { creatorInstructorId: req.user!.id },
    });
  }

  @Get(':courseId/materials/:materialId')
  async getOwnCourseMaterial(
    @CourseIdParam courseId: string,
    @MaterialIdParam materialId: string,
    @Req() req: Request,
  ): Promise<MaterialsGetOwnMaterialData> {
    const material = await this.coursesService.getCourseMaterial(courseId, materialId, {
      where: { creatorInstructorId: req.user!.id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  @Post(':courseId/materials')
  createOwnCourseMaterial(
    @CourseIdParam courseId: string,
    @Body() dto: MaterialsCreateOwnMaterialBody,
    @Req() req: Request,
  ): Promise<MaterialsCreateOwnMaterialData> {
    return this.coursesService.createCourseMaterial(dto, courseId, req.user!.id);
  }
}
