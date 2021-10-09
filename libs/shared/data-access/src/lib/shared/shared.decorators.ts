import { TCustomDecorator } from './shared.types';

export const SetMetadata = <K = string, V = any>(
  metadataKey: K,
  metadataValue: V,
): TCustomDecorator<K> => {
  const decoratorFactory = (target: object, key?: any, descriptor?: any) => {
    if (descriptor) {
      Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(metadataKey, metadataValue, target);
    return target;
  };
  decoratorFactory.KEY = metadataKey;
  return decoratorFactory;
};

export const FILTER_BY_VALIDATE_IF_KEY = 'FILTER_BY_VALIDATE_IF';
/**
 * We added this to enable filtering by `validateIf` on schemas.
 */
export const FilterByValidateIfFn = (value = true): TCustomDecorator<string> =>
  SetMetadata(FILTER_BY_VALIDATE_IF_KEY, value);
