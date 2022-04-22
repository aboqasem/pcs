import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateBy,
  ValidateNested,
} from 'class-validator';
import { supportedRuntimes } from '../judge/judge.data';
import { TCustomValidationArguments } from '../validation/validation.types';
import { MultipleChoiceQuestion } from './questions.subtypes';
import { CodeTestCase, McqType, QuestionType } from './questions.types';

export function IsQuestionId(): PropertyDecorator {
  return function (target, propertyKey) {
    IsPositive()(target, propertyKey);
  };
}

export function IsQuestionDescription(): PropertyDecorator {
  return function (target, propertyKey) {
    MinLength(5)(target, propertyKey);
  };
}

export function IsQuestionType(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(QuestionType)(target, propertyKey);
  };
}

export function IsQuestionMark(): PropertyDecorator {
  return function (target, propertyKey) {
    Transform(({ value }) => (value === '' ? 0 : value))(target, propertyKey);

    Type(() => Number)(target, propertyKey);

    Min(0)(target, propertyKey);

    // numeric(6, 2)'s max value is 9999.99
    Max(9999.99)(target, propertyKey);
  };
}

export function IsQuestionDuration(): PropertyDecorator {
  return function (target, propertyKey) {
    Transform(({ value }) => value || null)(target, propertyKey);

    Type(() => Number)(target, propertyKey);

    IsPositive()(target, propertyKey);

    // smallint's max value is 32767
    Max(32767)(target, propertyKey);
  };
}

export function IsShortAnswerQuestionAnswer(): PropertyDecorator {
  return function (target, propertyKey) {
    MinLength(1)(target, propertyKey);
  };
}

export function IsMultipleChoiceQuestionChoices(): PropertyDecorator {
  return function (target, propertyKey) {
    Transform(({ value, obj }: { value?: string[]; obj: Partial<MultipleChoiceQuestion> }) => {
      if (obj.type === McqType.Boolean) {
        return ['True', 'False'];
      }

      return value;
    })(target, propertyKey);

    IsArray()(target, propertyKey);

    ArrayMinSize(2)(target, propertyKey);

    MinLength(1, { each: true })(target, propertyKey);

    ArrayUnique()(target, propertyKey);
  };
}

export function IsMultipleChoiceQuestionCorrectChoices(): PropertyDecorator {
  return function (target, propertyKey) {
    IsArray()(target, propertyKey);

    ArrayMinSize(1)(target, propertyKey);

    ValidateBy(
      {
        name: 'areMultipleChoiceRadioQuestionCorrectChoicesValid',
        validator: {
          validate: (
            correctChoicesValue: unknown,
            args: TCustomValidationArguments<MultipleChoiceQuestion, 'correctChoices'>,
          ) => {
            if (args.object.type === McqType.Radio) {
              return Array.isArray(correctChoicesValue) && correctChoicesValue.length === 1;
            }

            return true;
          },
        },
      },
      {
        message: '$property must contain exactly one correct choice for a radio question',
      },
    )(target, propertyKey);

    ValidateBy(
      {
        name: 'areMultipleChoiceQuestionCorrectChoicesInChoices',
        validator: {
          validate: (
            correctChoicesValue: unknown,
            args: TCustomValidationArguments<MultipleChoiceQuestion, 'correctChoices'>,
          ) => {
            const { choices } = args.object;

            return (
              Array.isArray(correctChoicesValue) &&
              Array.isArray(choices) &&
              correctChoicesValue.every((correctChoice) =>
                choices.some((choice) => correctChoice === choice),
              )
            );
          },
        },
      },
      { message: "each value in $property must exist in the question's choices" },
    )(target, propertyKey);
  };
}

export function IsMultipleChoiceQuestionType(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(McqType)(target, propertyKey);
  };
}

export function IsCodingQuestionCodeSnippet(): PropertyDecorator {
  return function (target, propertyKey) {
    IsString()(target, propertyKey);
  };
}

export function IsCodingQuestionRuntime(): PropertyDecorator {
  return function (target, propertyKey) {
    IsString()(target, propertyKey);
    IsIn(supportedRuntimes, { message: 'Must be a valid runtime' })(target, propertyKey);
  };
}

export function IsCodingQuestionTestCases(): PropertyDecorator {
  return function (target, propertyKey) {
    IsArray()(target, propertyKey);

    ArrayMinSize(1)(target, propertyKey);

    Type(() => CodeTestCase)(target, propertyKey);

    ValidateNested({ each: true })(target, propertyKey);
  };
}
