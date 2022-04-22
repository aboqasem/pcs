import {
  CodingQuestionEntity,
  MultipleChoiceQuestionEntity,
  QuestionEntity,
  ShortAnswerQuestionEntity,
} from 'src/db/entities/question.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(QuestionEntity)
export class QuestionsRepository extends Repository<QuestionEntity> {}

@EntityRepository(ShortAnswerQuestionEntity)
export class ShortAnswerQuestionsRepository extends Repository<ShortAnswerQuestionEntity> {}

@EntityRepository(MultipleChoiceQuestionEntity)
export class MultipleChoiceQuestionsRepository extends Repository<MultipleChoiceQuestionEntity> {}

@EntityRepository(CodingQuestionEntity)
export class CodingQuestionsRepository extends Repository<CodingQuestionEntity> {}
