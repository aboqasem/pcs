import { PickType } from '@aboqasem/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { supportedRuntimes } from '../judge/judge.data';
import { QuestionDto } from './questions.classes';
import {
  IsCodingQuestionCodeSnippet,
  IsCodingQuestionRuntime,
  IsCodingQuestionTestCases,
  IsMultipleChoiceQuestionChoices,
  IsMultipleChoiceQuestionCorrectChoices,
  IsMultipleChoiceQuestionType,
  IsQuestionId,
  IsShortAnswerQuestionAnswer,
} from './questions.decorators';
import { CodeTestCase, McqType } from './questions.types';

export class ShortAnswerQuestion {
  // from Question
  @IsQuestionId()
  id!: number;

  @IsShortAnswerQuestionAnswer()
  answer!: string;

  /* JOINED RELATIONS */

  @Type(() => QuestionDto)
  @IsOptional()
  question?: QuestionDto;
}

export class ShortAnswerQuestionDto extends PickType(ShortAnswerQuestion, ['id', 'answer']) {}

export class CreateShortAnswerQuestionDto extends PickType(ShortAnswerQuestion, ['answer']) {}

export class MultipleChoiceQuestion {
  // from Question
  @IsQuestionId()
  id!: number;

  @IsMultipleChoiceQuestionChoices()
  choices!: string[];

  @IsMultipleChoiceQuestionCorrectChoices()
  correctChoices!: string[];

  @IsMultipleChoiceQuestionType()
  type!: McqType;

  /* JOINED RELATIONS */

  @Type(() => QuestionDto)
  @IsOptional()
  question?: QuestionDto;
}

export class MultipleChoiceQuestionDto extends PickType(MultipleChoiceQuestion, [
  'id',
  'choices',
  'correctChoices',
  'type',
  'question',
]) {}

export class CreateMultipleChoiceQuestionDto extends PickType(MultipleChoiceQuestion, [
  'choices',
  'correctChoices',
  'type',
]) {}

export class CodingQuestion {
  // from Question
  @IsQuestionId()
  id!: number;

  @IsCodingQuestionCodeSnippet()
  codeSnippet!: string;

  @IsCodingQuestionRuntime()
  runtime!: typeof supportedRuntimes[number];

  @IsCodingQuestionTestCases()
  testCases!: CodeTestCase[];

  /* JOINED RELATIONS */

  @Type(() => QuestionDto)
  @IsOptional()
  question?: QuestionDto;
}

export class CodingQuestionDto extends PickType(CodingQuestion, [
  'id',
  'codeSnippet',
  'runtime',
  'testCases',
  'question',
]) {}

export class CreateCodingQuestionDto extends PickType(CodingQuestion, [
  'codeSnippet',
  'runtime',
  'testCases',
]) {}
