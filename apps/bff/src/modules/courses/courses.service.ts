import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto, CreatedCourseDto } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { createQueryBuilder, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async getCourse(
    courseId: CourseEntity['id'],
    select?: (keyof CourseEntity)[],
    relations?: (keyof CourseEntity)[],
  ): Promise<CourseEntity> {
    const course = await this.coursesRepository.findOne({
      select,
      relations,
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async courseExists(courseId: CourseEntity['id']): Promise<boolean> {
    return !!(await this.getCourse(courseId, ['id']));
  }

  getInstructorCourses(
    instructorId: UserEntity['id'],
    select?: (keyof CourseEntity)[],
    relations?: (keyof CourseEntity)[],
  ): Promise<CourseEntity[]> {
    return this.coursesRepository.find({
      select,
      relations,
      where: {
        instructorId,
      },
    });
  }

  getStudentCourses(
    studentId: UserEntity['id'],
    select?: (keyof CourseEntity)[],
    relations?: (keyof CourseEntity)[],
  ): Promise<CourseEntity[]> {
    return this.coursesRepository
      .find({
        select,
        relations: ['studentEnrollments', ...(relations ?? [])],
        where: (qb: SelectQueryBuilder<CourseEntity>) => {
          qb.where(`"CourseEntity__studentEnrollments"."studentId" = :studentId`, { studentId });
        },
      })
      .then((courses) => {
        if (!relations?.includes('studentEnrollments')) {
          courses.forEach((course) => {
            delete course.studentEnrollments;
          });
        }
        return courses;
      });
  }

  async getInstructorCourse(
    instructorId: UserEntity['id'],
    courseId: CourseEntity['id'],
    select?: (keyof CourseEntity)[],
    relations?: (keyof CourseEntity)[],
  ): Promise<CourseEntity> {
    select = select ?? ['id', 'title', 'description', 'beginsAt', 'endsAt', 'instructorId'];

    const course = await this.getCourse(
      courseId,
      // because we want the instructorId for comparison, we have to select all those fields in MaterialDto as well as instructorId
      [...select, 'instructorId'],
      relations,
    );

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You are not an instructor of this course');
    }

    if (select && !select.includes('instructorId')) {
      delete (course as Partial<CourseEntity>).instructorId;
    }

    return course;
  }

  async getStudentCourse(
    studentId: UserEntity['id'],
    courseId: CourseEntity['id'],
    select?: (keyof CourseEntity)[],
    relations?: (keyof CourseEntity)[],
  ): Promise<CourseEntity> {
    return this.getStudentCourses(studentId, select, relations).then((courses) => {
      const course = courses.find((course) => course.id === courseId);

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      return course;
    });
  }

  async instructorCourseExists(
    instructorId: UserEntity['id'],
    courseId: CourseEntity['id'],
  ): Promise<boolean> {
    return !!(await this.getInstructorCourse(instructorId, courseId, ['id']));
  }

  async studentCourseExists(
    studentId: UserEntity['id'],
    courseId: CourseEntity['id'],
  ): Promise<boolean> {
    return !!(await this.getStudentCourse(studentId, courseId, ['id']));
  }

  createInstructorCourse(
    instructorId: UserEntity['id'],
    dto: CreateCourseDto,
  ): Promise<CreatedCourseDto> {
    return this.coursesRepository
      .insert({ ...dto, instructorId })
      .then(({ identifiers: [identifier] }) => ({ id: identifier!.id as CreatedCourseDto['id'] }));
  }

  async getCoursePeople(
    courseId: CourseEntity['id'],
    select?: (keyof UserEntity)[],
  ): Promise<UserEntity[]> {
    await this.courseExists(courseId);

    return createQueryBuilder(UserEntity, 'user')
      .where(`"user"."id" = (SELECT "instructorId" FROM "course" WHERE "id" = :courseId)`, {
        courseId,
      })
      .orWhere(
        `"user"."id" IN (SELECT "studentId" FROM "student_enrollment" WHERE "courseId" = :courseId)`,
        {
          courseId,
        },
      )
      .select(select?.map((field) => `user.${field}`) as string[])
      .getMany();
  }
}
