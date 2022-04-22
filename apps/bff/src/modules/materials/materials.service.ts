import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatedMaterialDto,
  CreateMaterialDto,
  MaterialStatus,
  TCoursesAnnounceMaterialData,
} from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { MaterialsRepository } from 'src/db/repositories/material.repository';
import { CoursesService } from 'src/modules/courses/courses.service';
import { SelectQueryBuilder } from 'typeorm';

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
      order: {
        beginsAt: 'ASC',
      },
    });
  }

  async getStudentCourseMaterials(
    studentId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    select?: (keyof MaterialEntity)[],
    relations?: (keyof MaterialEntity)[],
  ): Promise<MaterialEntity[]> {
    await this.coursesService.studentCourseExists(studentId, createdForCourseId);

    return this.materialsRepository
      .find({
        select,
        relations: [
          'questions',
          'createdForCourse',
          'createdForCourse.studentEnrollments',
          ...(relations ?? []),
        ],
        where: (qb: SelectQueryBuilder<MaterialEntity>) => {
          qb.where(`"${qb.alias}__createdForCourse"."id" = :createdForCourseId`, {
            createdForCourseId,
          })
            .andWhere(
              `"${qb.alias}__createdForCourse__studentEnrollments"."studentId" = :studentId`,
              { studentId },
            )
            .andWhere(`"${qb.alias}"."status" = :status`, { status: MaterialStatus.Announced })
            .orderBy(`"${qb.alias}"."beginsAt"`, 'ASC');
        },
      })
      .then((materials) => materials.filter((m) => m.questions!.length > 0))
      .then((materials) => {
        if (
          !relations?.includes('createdForCourse.studentEnrollments' as any) ||
          !relations?.includes('createdForCourse' as any)
        ) {
          materials.forEach((material) => {
            if (!relations?.includes('questions' as any)) {
              delete material.questions;
            }
            if (!relations?.includes('createdForCourse' as any)) {
              const { studentEnrollments } = material.createdForCourse!;
              delete material.createdForCourse;
              if (relations?.includes('createdForCourse.studentEnrollments' as any)) {
                material.createdForCourse = { studentEnrollments } as any;
              }
            }
            if (!relations?.includes('createdForCourse.studentEnrollments' as any)) {
              delete material.createdForCourse?.studentEnrollments;
            }
          });
        }

        return materials;
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

  async getStudentCourseMaterial(
    studentId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
    select?: (keyof MaterialEntity)[],
    relations?: (keyof MaterialEntity)[],
  ): Promise<MaterialEntity> {
    await this.coursesService.studentCourseExists(studentId, createdForCourseId);

    return this.getStudentCourseMaterials(studentId, createdForCourseId, select, relations).then(
      (materials) => {
        const material = materials.find((material) => material.id === materialId);

        if (!material) {
          throw new NotFoundException('Material not found');
        }

        return material;
      },
    );
  }

  async instructorCourseMaterialExists(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
  ): Promise<boolean> {
    return !!(await this.getInstructorCourseMaterial(
      creatorInstructorId,
      createdForCourseId,
      materialId,
      ['id'],
    ));
  }

  async studentCourseMaterialExists(
    studentId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
  ): Promise<boolean> {
    return !!(await this.getStudentCourseMaterial(studentId, createdForCourseId, materialId, [
      'id',
    ]));
  }

  async createInstructorCourseMaterial(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    dto: CreateMaterialDto,
  ): Promise<CreatedMaterialDto> {
    await this.coursesService.instructorCourseExists(creatorInstructorId, createdForCourseId);

    const {
      identifiers: [identifier],
    } = await this.materialsRepository.insert({ ...dto, createdForCourseId, creatorInstructorId });

    return { id: identifier!.id as CreatedMaterialDto['id'] };
  }

  async announceInstructorCourseMaterial(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
  ): Promise<TCoursesAnnounceMaterialData> {
    await this.instructorCourseMaterialExists(creatorInstructorId, createdForCourseId, materialId);

    console.log(
      await this.materialsRepository.update(
        { id: materialId, createdForCourseId, creatorInstructorId },
        { status: MaterialStatus.Announced },
      ),
    );

    return true;
  }
}
