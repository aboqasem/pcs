import {
  CodeTestCase,
  CodingQuestion,
  MaterialDto,
  McqType,
  MultipleChoiceQuestion,
  Question,
  QuestionDto,
  QuestionType,
  ShortAnswerQuestion,
  supportedRuntimes,
} from '@pcs/shared-data-access';
import { MaterialEntity } from 'src/db/entities/material.entity';
import { numericTransformer } from 'src/db/transformers/numeric.transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('question')
export class QuestionEntity extends Question {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('text')
  description!: string;

  @Column('enum', {
    enum: QuestionType,
    enumName: 'question_type',
  })
  type!: QuestionType;

  @Column('numeric', { precision: 6, scale: 2, transformer: numericTransformer })
  mark!: number;

  @Column('smallint', { nullable: true })
  duration?: number | null;

  /* JOINED RELATIONS */

  @Column('uuid')
  materialId!: string;

  @ManyToOne(() => MaterialEntity, (material) => material.questions)
  @JoinColumn({ name: 'materialId', referencedColumnName: 'id' })
  material?: MaterialDto;
}

/* SUBTYPES */

@Entity('short_answer_question')
export class ShortAnswerQuestionEntity extends ShortAnswerQuestion {
  // from QuestionEntity
  @PrimaryColumn()
  id!: number;

  @Column('text')
  answer!: string;

  /* JOINED RELATIONS */

  @OneToOne(() => QuestionEntity, undefined, { nullable: false, primary: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  question?: QuestionDto;
}

@Entity('multiple_choice_question')
export class MultipleChoiceQuestionEntity extends MultipleChoiceQuestion {
  // from QuestionEntity
  @PrimaryColumn()
  id!: number;

  @Column('jsonb')
  choices!: string[];

  @Column('text', { array: true })
  correctChoices!: string[];

  @Column('enum', { enum: McqType })
  type!: McqType;

  /* JOINED RELATIONS */

  @OneToOne(() => QuestionEntity, undefined, { nullable: false, primary: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  question?: QuestionDto;
}

@Entity('coding_question')
export class CodingQuestionEntity extends CodingQuestion {
  // from QuestionEntity
  @PrimaryColumn()
  id!: number;

  @Column('text')
  codeSnippet!: string;

  @Column('text')
  runtime!: typeof supportedRuntimes[number];

  @Column('jsonb')
  testCases!: CodeTestCase[];

  /* JOINED RELATIONS */

  @OneToOne(() => QuestionEntity, undefined, { nullable: false, primary: true })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  question?: QuestionDto;
}
