import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, validateSync } from '../validation/class-validator';

export function transformToOtherSync<T extends { [K in keyof T]: T[K] }, V>(
  cls: ClassConstructor<T>,
  plain: V,
): T {
  const transformed = plainToInstance(cls, plain);

  validateSync(transformed, { whitelist: true });

  return transformed;
}

export async function transformToOther<T extends { [K in keyof T]: T[K] }, V>(
  cls: ClassConstructor<T>,
  plain: V,
): Promise<T> {
  const transformed = plainToInstance(cls, plain);

  await validate(transformed, { whitelist: true });

  return transformed;
}
