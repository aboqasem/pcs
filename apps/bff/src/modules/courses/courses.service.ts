import { Injectable } from '@nestjs/common';
import { CourseDto, CreateCourseDto, CreatedCourseDto } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  getInstructorCourses(
    instructorId: UserEntity['id'],
    options?: FindManyOptions<CourseEntity>,
  ): Promise<CourseDto[]> {
    return this.coursesRepository.find({
      ...options,
      where: {
        ...(typeof options?.where === 'object' ? options.where : undefined),
        instructorId,
      },
    });
  }

  getInstructorCourse(
    instructorId: UserEntity['id'],
    courseId: CourseEntity['id'],
    options?: FindManyOptions<CourseEntity>,
  ): Promise<CourseDto | undefined> {
    return this.coursesRepository.findOne({
      ...options,
      where: {
        ...(typeof options?.where === 'object' ? options.where : undefined),
        id: courseId,
        instructorId,
      },
    });
  }

  createInstructorCourse(
    instructorId: UserEntity['id'],
    dto: CreateCourseDto,
  ): Promise<CreatedCourseDto> {
    return this.coursesRepository
      .insert({ ...dto, instructorId })
      .then(({ identifiers: [{ id }] }) => ({ id: id as CreatedCourseDto['id'] }));
  }
}
