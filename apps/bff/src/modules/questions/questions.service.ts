import { Injectable } from '@nestjs/common';
import {
  CreatedQuestionDto,
  CreateQuestionDto,
  QuestionType,
  TMaterialQuestion,
} from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { MaterialEntity } from 'src/db/entities/material.entity';
import {
  CodingQuestionEntity,
  MultipleChoiceQuestionEntity,
  QuestionEntity,
  ShortAnswerQuestionEntity,
} from 'src/db/entities/question.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { MaterialsService } from 'src/modules/materials/materials.service';
import { getManager } from 'typeorm';

@Injectable()
export class QuestionsService {
  constructor(private readonly materialsService: MaterialsService) {}

  async getInstructorCourseMaterialQuestions(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
  ): Promise<TMaterialQuestion[]> {
    await this.materialsService.instructorCourseMaterialExists(
      creatorInstructorId,
      createdForCourseId,
      materialId,
    );

    return getManager().transaction(async (em) =>
      (
        await Promise.all(
          [ShortAnswerQuestionEntity, MultipleChoiceQuestionEntity, CodingQuestionEntity].map(
            (Entity) =>
              em
                .createQueryBuilder(Entity, 'subtype_question')
                .leftJoinAndSelect('subtype_question.question', 'supertype_question') // question is joined and selected
                .leftJoin('supertype_question.material', 'material')
                .where('material.id = :materialId', { materialId })
                .andWhere('material.createdForCourseId = :createdForCourseId', {
                  createdForCourseId,
                })
                .andWhere('material.creatorInstructorId = :creatorInstructorId', {
                  creatorInstructorId,
                })
                .getMany(),
          ),
        )
      )
        .flat()
        .map((q) => {
          // question is QuestionEntity, q is ShortAnswerQuestionEntity | MultipleChoiceQuestionEntity | CodingQuestionEntity
          const { question } = q;
          delete q.question;
          return {
            ...q,
            // QuestionEntity.type overrides MultipleChoiceQuestionEntity.type
            ...question,
            // Rename the overridden MultipleChoiceQuestionEntity.type to mcqType
            ...((q as unknown as MultipleChoiceQuestionEntity).type
              ? { mcqType: (q as unknown as MultipleChoiceQuestionEntity).type }
              : {}),
          } as TMaterialQuestion;
        }),
    );
  }

  async getStudentCourseMaterialQuestions(
    studentId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
  ): Promise<TMaterialQuestion[]> {
    await this.materialsService.studentCourseMaterialExists(
      studentId,
      createdForCourseId,
      materialId,
    );

    return getManager().transaction(async (em) =>
      (
        await Promise.all(
          [ShortAnswerQuestionEntity, MultipleChoiceQuestionEntity, CodingQuestionEntity].map(
            (Entity) =>
              em
                .createQueryBuilder(Entity, 'subtype_question')
                .leftJoinAndSelect('subtype_question.question', 'supertype_question') // question is joined and selected
                .leftJoin('supertype_question.material', 'material')
                .where('material.id = :materialId', { materialId })
                .andWhere('material.createdForCourseId = :createdForCourseId', {
                  createdForCourseId,
                })
                .leftJoin('material.createdForCourse', 'course')
                .leftJoin('course.studentEnrollments', 'student_enrollment')
                .leftJoin('student_enrollment.student', 'student')
                .andWhere('student.id = :studentId', { studentId })
                .getMany(),
          ),
        )
      )
        .flat()
        .map((q) => {
          // question is QuestionEntity, q is ShortAnswerQuestionEntity | MultipleChoiceQuestionEntity | CodingQuestionEntity
          const { question } = q;
          delete q.question;
          return {
            ...q,
            // QuestionEntity.type overrides MultipleChoiceQuestionEntity.type
            ...question,
            // Rename the overridden MultipleChoiceQuestionEntity.type to mcqType
            ...((q as unknown as MultipleChoiceQuestionEntity).type
              ? { mcqType: (q as unknown as MultipleChoiceQuestionEntity).type }
              : {}),
          } as TMaterialQuestion;
        }),
    );
  }

  async createInstructorCourseMaterialQuestion(
    creatorInstructorId: UserEntity['id'],
    createdForCourseId: CourseEntity['id'],
    materialId: MaterialEntity['id'],
    { content: subType, ...dto }: CreateQuestionDto,
  ): Promise<CreatedQuestionDto> {
    await this.materialsService.instructorCourseMaterialExists(
      creatorInstructorId,
      createdForCourseId,
      materialId,
    );

    return getManager().transaction(async (em) => {
      const {
        identifiers: [identifier],
      } = await em.insert(QuestionEntity, { ...dto, materialId });

      const Entity = {
        [QuestionType.ShortAnswer]: ShortAnswerQuestionEntity,
        [QuestionType.MultipleChoice]: MultipleChoiceQuestionEntity,
        [QuestionType.Coding]: CodingQuestionEntity,
      }[dto.type];

      await em.insert(Entity, { id: identifier!.id, ...subType });

      return { id: identifier!.id as CreatedQuestionDto['id'] };
    });
  }
}
