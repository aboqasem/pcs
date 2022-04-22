import { PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { MaterialDto } from '../materials/materials.classes';
import { IsMaterialId } from '../materials/materials.decorators';
import {
  IsQuestionDescription,
  IsQuestionDuration,
  IsQuestionId,
  IsQuestionMark,
  IsQuestionType,
} from './questions.decorators';
import {
  CreateCodingQuestionDto,
  CreateMultipleChoiceQuestionDto,
  CreateShortAnswerQuestionDto,
} from './questions.subtypes';
import { QuestionType } from './questions.types';

export class Question {
  @IsQuestionId()
  id!: number;

  @IsQuestionDescription()
  description!: string;

  @IsQuestionType()
  type!: QuestionType;

  @IsQuestionMark()
  mark!: number;

  @IsQuestionDuration()
  duration?: number | null;

  /* JOINED RELATIONS */

  @IsMaterialId()
  materialId!: string;

  @Type(() => MaterialDto)
  @IsOptional()
  material?: MaterialDto;
}

export class QuestionDto extends PickType(Question, [
  'id',
  'description',
  'type',
  'mark',
  'duration',
  'materialId',
  'material',
]) {}

export class CreateQuestionDto extends PickType(Question, [
  'description',
  'type',
  'mark',
  'duration',
]) {
  @Type(
    (options) =>
      ({
        [QuestionType.ShortAnswer]: CreateShortAnswerQuestionDto,
        [QuestionType.MultipleChoice]: CreateMultipleChoiceQuestionDto,
        [QuestionType.Coding]: CreateCodingQuestionDto,
      }[(options!.object as CreateQuestionDto).type]),
  )
  @IsObject()
  @ValidateNested()
  content!:
    | CreateShortAnswerQuestionDto
    | CreateMultipleChoiceQuestionDto
    | CreateCodingQuestionDto;
}

export class CreatedQuestionDto extends PickType(Question, ['id']) {}

export class UpdateQuestionDto extends CreateQuestionDto {}
