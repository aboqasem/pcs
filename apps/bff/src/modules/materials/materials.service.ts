import { Injectable } from '@nestjs/common';
import { CreatedMaterialDto, CreateMaterialDto, MaterialDto } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { MaterialsRepository } from 'src/db/repositories/material.repository';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class MaterialsService {
  constructor(private readonly materialsRepository: MaterialsRepository) {}

  getInstructorCourseMaterials(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    options?: FindManyOptions<MaterialEntity>,
  ): Promise<MaterialDto[]> {
    return this.materialsRepository.find({
      ...options,
      where: {
        ...(typeof options?.where === 'object' ? options.where : undefined),
        createdForCourseId,
        creatorInstructorId,
      },
    });
  }

  getInstructorCourseMaterial(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
    options?: FindManyOptions<MaterialEntity>,
  ): Promise<MaterialDto | undefined> {
    return this.materialsRepository.findOne(
      { id: materialId, createdForCourseId, creatorInstructorId },
      options,
    );
  }

  createInstructorCourseMaterial(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    dto: CreateMaterialDto,
  ): Promise<CreatedMaterialDto> {
    return this.materialsRepository
      .insert({ ...dto, createdForCourseId, creatorInstructorId })
      .then(({ identifiers: [{ id }] }) => ({ id: id as CreatedMaterialDto['id'] }));
  }
}
