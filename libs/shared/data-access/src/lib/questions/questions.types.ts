import { IsArray, IsOptional, IsString } from 'class-validator';
import { QuestionDto } from '../questions/questions.classes';
import {
  CodingQuestionDto,
  MultipleChoiceQuestionDto,
  ShortAnswerQuestionDto,
} from '../questions/questions.subtypes';
import { TRename, TReplace } from '../shared/shared.types';

export enum QuestionType {
  ShortAnswer = 'short_answer',
  MultipleChoice = 'multiple_choice',
  Coding = 'coding',
}

export enum McqType {
  Boolean = 'boolean',
  Radio = 'radio',
  Checkbox = 'checkbox',
}

export class CodeTestCase {
  @IsString()
  input!: string;

  @IsString()
  output!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  args?: string[];
}

export type TMaterialQuestion =
  | (ShortAnswerQuestionDto & TReplace<QuestionDto, { type: QuestionType.ShortAnswer }>)
  | (TRename<MultipleChoiceQuestionDto, 'type', 'mcqType'> &
      TReplace<QuestionDto, { type: QuestionType.MultipleChoice }>)
  | (CodingQuestionDto & TReplace<QuestionDto, { type: QuestionType.Coding }>);
