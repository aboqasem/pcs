import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatedMaterialDto, CreateMaterialDto } from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { MaterialsRepository } from 'src/db/repositories/material.repository';
import { CoursesService } from 'src/modules/courses/courses.service';

@Injectable()
export class MaterialsService {
  constructor(
    private readonly materialsRepository: MaterialsRepository,
    private readonly coursesService: CoursesService,
  ) {}

  async getInstructorCourseMaterials(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    select?: (keyof MaterialEntity)[],
    relations?: (keyof MaterialEntity)[],
  ): Promise<MaterialEntity[]> {
    await this.coursesService.instructorCourseExists(creatorInstructorId, createdForCourseId);

    return this.materialsRepository.find({
      select,
      relations,
      where: {
        createdForCourseId,
        creatorInstructorId,
      },
    });
  }

  async getInstructorCourseMaterial(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
    select?: (keyof MaterialEntity)[],
    relations?: (keyof MaterialEntity)[],
  ): Promise<MaterialEntity> {
    await this.coursesService.instructorCourseExists(creatorInstructorId, createdForCourseId);

    const material = await this.materialsRepository.findOne(
      { id: materialId, createdForCourseId, creatorInstructorId },
      { select, relations },
    );

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async createInstructorCourseMaterial(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    dto: CreateMaterialDto,
  ): Promise<CreatedMaterialDto> {
    await this.coursesService.instructorCourseExists(creatorInstructorId, createdForCourseId);

    const {
      identifiers: [{ id }],
    } = await this.materialsRepository.insert({ ...dto, createdForCourseId, creatorInstructorId });

    return { id: id as CreatedMaterialDto['id'] };
  }
}
