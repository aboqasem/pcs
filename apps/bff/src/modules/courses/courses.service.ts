import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async getInstructorCourse(
    instructorId: UserEntity['id'],
    courseId: CourseEntity['id'],
    select?: (keyof CourseEntity)[],
    relations?: (keyof CourseEntity)[],
  ): Promise<CourseEntity> {
    select = select ?? ['id', 'title', 'description', 'beginsAt', 'endsAt', 'instructorId'];

    const course = await this.coursesRepository.findOne({
      // because we want the instructorId for comparison, we have to select all those fields in MaterialDto as well as instructorId
      select: [...select, 'instructorId'],
      relations,
      where: {
        id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You are not an instructor of this course');
    }

    if (select && !select.includes('instructorId')) {
      delete (course as Partial<CourseEntity>).instructorId;
    }

    return course;
  }

  async instructorCourseExists(
    instructorId: UserEntity['id'],
    courseId: CourseEntity['id'],
  ): Promise<boolean> {
    return !!(await this.getInstructorCourse(instructorId, courseId));
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
