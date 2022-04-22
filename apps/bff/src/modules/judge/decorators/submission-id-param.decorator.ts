import { Param } from '@nestjs/common';

export const SubmissionId = (): ParameterDecorator => Param('submissionId');
