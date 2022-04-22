import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsString, MinLength, ValidateNested } from 'class-validator';
import { CodeTestCase } from '../questions/questions.types';
import { supportedRuntimes } from './judge.data';

export class JudgeSubmission {
  @IsString()
  @IsIn(supportedRuntimes, { message: 'Must be a valid runtime' })
  runtime!: typeof supportedRuntimes[number];

  @IsString()
  @MinLength(1)
  codeSnippet!: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CodeTestCase)
  @ValidateNested({ each: true })
  testCases!: CodeTestCase[];
}
