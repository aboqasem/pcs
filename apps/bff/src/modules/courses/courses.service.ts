import { Injectable } from '@nestjs/common';
import {
  CourseDto,
  CreateCourseDto,
  CreatedCourseDto,
  CreatedMaterialDto,
  CreateMaterialDto,
  MaterialDto,
} from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { MaterialsRepository } from 'src/db/repositories/material.repository';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly materialsRepository: MaterialsRepository,
  ) {}

  getCourses(options?: FindManyOptions<CourseEntity>): Promise<CourseDto[]> {
    return this.coursesRepository.find(options);
  }

  getCourse(
    id: CourseEntity['id'],
    options?: FindManyOptions<CourseEntity>,
  ): Promise<CourseDto | undefined> {
    return this.coursesRepository.findOne({ id }, options);
  }

  createCourse(dto: CreateCourseDto, instructorId: UserEntity['id']): Promise<CreatedCourseDto> {
    return this.coursesRepository
      .insert({ ...dto, instructorId })
      .then(({ identifiers: [{ id }] }) => ({ id: id as CreatedCourseDto['id'] }));
  }

  getCourseMaterials(
    createdForCourseId: CourseEntity['id'],
    options?: FindManyOptions<MaterialEntity>,
  ): Promise<MaterialDto[]> {
    return this.materialsRepository.find({
      ...options,
      where: {
        ...(typeof options?.where === 'object' ? options.where : undefined),
        createdForCourseId,
      },
    });
  }

  getCourseMaterial(
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
    options?: FindManyOptions<MaterialEntity>,
  ): Promise<MaterialDto | undefined> {
    return this.materialsRepository.findOne({ id: materialId, createdForCourseId }, options);
  }

  createCourseMaterial(
    dto: CreateMaterialDto,
    createdForCourseId: CourseEntity['id'],
    creatorInstructorId: UserEntity['id'],
  ): Promise<CreatedMaterialDto> {
    return this.materialsRepository
      .insert({ ...dto, createdForCourseId, creatorInstructorId })
      .then(({ identifiers: [{ id }] }) => ({ id: id as CreatedMaterialDto['id'] }));
  }
}
