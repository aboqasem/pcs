import { NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common';

export const MaterialIdParam = (): ParameterDecorator =>
  Param(
    'materialId',
    new ParseUUIDPipe({
      exceptionFactory: () => new NotFoundException('Material not found'),
    }),
  );
