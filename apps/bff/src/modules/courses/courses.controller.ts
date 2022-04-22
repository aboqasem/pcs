import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import {
  CoursesAddStudentBody,
  CoursesCreateCourseBody,
  CoursesCreateMaterialBody,
  CoursesCreateMaterialQuestionBody,
  TCoursesAddStudentData,
  TCoursesAnnounceMaterialData,
  TCoursesCreateCourseData,
  TCoursesCreateMaterialData,
  TCoursesCreateMaterialQuestionData,
  TCoursesGetCourseData,
  TCoursesGetCoursesData,
  TCoursesGetMaterialData,
  TCoursesGetMaterialQuestionsData,
  TCoursesGetMaterialsData,
  TCoursesGetPeopleData,
  UserRole,
} from '@pcs/shared-data-access';
import { Request } from 'express';
import { UserAuth } from 'src/modules/auth/decorators/user-auth.decorator';
import { CourseIdParam } from 'src/modules/courses/decorators/course-id-param.decorator';
import { MaterialIdParam } from 'src/modules/materials/decorators/material-id-param.decorator';
import { MaterialsService } from 'src/modules/materials/materials.service';
import { QuestionsService } from 'src/modules/questions/questions.service';
import { StudentEnrollmentsService } from 'src/modules/student-enrollments/student-enrollments.service';
import { CoursesService } from './courses.service';

@Controller('courses')
@UserAuth({ roles: [UserRole.Instructor] })
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly materialsService: MaterialsService,
    private readonly questionsService: QuestionsService,
    private readonly studentsService: StudentEnrollmentsService,
  ) {}

  @Get()
  @UserAuth({ roles: [UserRole.Instructor, UserRole.Student] })
  async getCourses(@Req() req: Request): Promise<TCoursesGetCoursesData> {
    if (req.user!.role === UserRole.Instructor) {
      return this.coursesService.getInstructorCourses(req.user!.id);
    }
    return this.coursesService.getStudentCourses(req.user!.id);
  }

  @Get(':courseId')
  @UserAuth({ roles: [UserRole.Instructor, UserRole.Student] })
  async getCourse(
    @CourseIdParam() courseId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetCourseData> {
    if (req.user!.role === UserRole.Instructor) {
      return this.coursesService.getInstructorCourse(req.user!.id, courseId);
    }
    return this.coursesService.getStudentCourse(req.user!.id, courseId);
  }

  @Post()
  createCourse(
    @Body() dto: CoursesCreateCourseBody,
    @Req() req: Request,
  ): Promise<TCoursesCreateCourseData> {
    return this.coursesService.createInstructorCourse(req.user!.id, dto);
  }

  @Get(':courseId/materials')
  @UserAuth({ roles: [UserRole.Instructor, UserRole.Student] })
  async getCourseMaterials(
    @CourseIdParam() courseId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetMaterialsData> {
    if (req.user!.role === UserRole.Instructor) {
      return this.materialsService.getInstructorCourseMaterials(req.user!.id, courseId);
    }
    return this.materialsService.getStudentCourseMaterials(req.user!.id, courseId);
  }

  @Get(':courseId/materials/:materialId')
  @UserAuth({ roles: [UserRole.Instructor, UserRole.Student] })
  getCourseMaterial(
    @CourseIdParam() courseId: string,
    @MaterialIdParam() materialId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetMaterialData> {
    if (req.user!.role === UserRole.Instructor) {
      return this.materialsService.getInstructorCourseMaterial(req.user!.id, courseId, materialId);
    }
    return this.materialsService.getStudentCourseMaterial(req.user!.id, courseId, materialId);
  }

  @Patch(':courseId/materials/:materialId/announce')
  announceCourseMaterial(
    @CourseIdParam() courseId: string,
    @MaterialIdParam() materialId: string,
    @Req() req: Request,
  ): Promise<TCoursesAnnounceMaterialData> {
    return this.materialsService.announceInstructorCourseMaterial(
      req.user!.id,
      courseId,
      materialId,
    );
  }

  @Post(':courseId/materials')
  createCourseMaterial(
    @CourseIdParam() courseId: string,
    @Body() dto: CoursesCreateMaterialBody,
    @Req() req: Request,
  ): Promise<TCoursesCreateMaterialData> {
    return this.materialsService.createInstructorCourseMaterial(req.user!.id, courseId, dto);
  }

  @Get(':courseId/materials/:materialId/questions')
  @UserAuth({ roles: [UserRole.Instructor, UserRole.Student] })
  async getCourseMaterialQuestions(
    @CourseIdParam() courseId: string,
    @MaterialIdParam() materialId: string,
    @Req() req: Request,
  ): Promise<TCoursesGetMaterialQuestionsData> {
    if (req.user!.role === UserRole.Instructor) {
      return this.questionsService.getInstructorCourseMaterialQuestions(
        req.user!.id,
        courseId,
        materialId,
      );
    }
    return this.questionsService.getStudentCourseMaterialQuestions(
      req.user!.id,
      courseId,
      materialId,
    );
  }

  @Post(':courseId/materials/:materialId/questions')
  createCourseMaterialQuestion(
    @CourseIdParam() courseId: string,
    @MaterialIdParam() materialId: string,
    @Body() dto: CoursesCreateMaterialQuestionBody,
    @Req() req: Request,
  ): Promise<TCoursesCreateMaterialQuestionData> {
    return this.questionsService.createInstructorCourseMaterialQuestion(
      req.user!.id,
      courseId,
      materialId,
      dto,
    );
  }

  @Get(':courseId/people')
  @UserAuth({ roles: [UserRole.Instructor, UserRole.Student] })
  async getCoursePeople(@CourseIdParam() courseId: string): Promise<TCoursesGetPeopleData> {
    return this.coursesService.getCoursePeople(courseId);
  }

  @Post(':courseId/students')
  addCourseStudent(
    @CourseIdParam() courseId: string,
    @Body() dto: CoursesAddStudentBody,
    @Req() req: Request,
  ): Promise<TCoursesAddStudentData> {
    return this.studentsService.addAndInformInstructorCourseStudent(req.user!.id, courseId, dto);
  }
}
