import { Injectable } from '@nestjs/common';
import { CreatedMaterialDto, CreateMaterialDto } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { MaterialsRepository } from 'src/db/repositories/material.repository';

@Injectable()
export class MaterialsService {
  constructor(private readonly materialsRepository: MaterialsRepository) {}

  getInstructorCourseMaterials(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    select?: (keyof MaterialEntity)[],
    relations?: (keyof MaterialEntity)[],
  ): Promise<MaterialEntity[]> {
    return this.materialsRepository.find({
      select,
      relations,
      where: {
        createdForCourseId,
        creatorInstructorId,
      },
    });
  }

  getInstructorCourseMaterial(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
    select?: (keyof MaterialEntity)[],
    relations?: (keyof MaterialEntity)[],
  ): Promise<MaterialEntity | undefined> {
    return this.materialsRepository.findOne(
      { id: materialId, createdForCourseId, creatorInstructorId },
      { select, relations },
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
