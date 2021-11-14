import { NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';

export const CourseIdParam = (): ParameterDecorator =>
  Param(
    'courseId',
    new ParseUUIDPipe({
      exceptionFactory: () => new NotFoundException('Course not found'),
    }),
  );
