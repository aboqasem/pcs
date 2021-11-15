import { Injectable } from '@nestjs/common';
import { CreateCourseDto, CreatedCourseDto } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { CoursesRepository } from 'src/db/repositories/course.repository';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

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

  getInstructorCourse(
    instructorId: UserEntity['id'],
    courseId: CourseEntity['id'],
    select?: (keyof CourseEntity)[],
    relations?: (keyof CourseEntity)[],
  ): Promise<CourseEntity | undefined> {
    return this.coursesRepository.findOne({
      select,
      relations,
      where: {
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
