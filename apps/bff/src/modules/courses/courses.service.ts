import { Injectable } from '@nestjs/common';
import { CourseDto, CreateCourseDto, CreatedCourseDto } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  getCourses(options?: FindManyOptions<CourseEntity>): Promise<CourseDto[]> {
    return this.coursesRepository.find(options);
  }

  getCourse(id: string, options?: FindManyOptions<CourseEntity>): Promise<CourseDto | undefined> {
    return this.coursesRepository.findOne({ id }, options);
  }

  createCourse(dto: CreateCourseDto, instructorId: number): Promise<CreatedCourseDto> {
    return this.coursesRepository
      .insert({ ...dto, instructorId })
      .then(({ identifiers: [{ id }] }) => ({ id: id as CreatedCourseDto['id'] }));
  }
}
