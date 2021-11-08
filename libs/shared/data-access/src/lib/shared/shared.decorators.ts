import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';
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

export function IsValidDate(): PropertyDecorator {
  return function (target, propertyKey) {
    Transform(({ value }) => {
      const date = new Date(value ?? '');

      if (date.toString() === 'Invalid Date') {
        return null;
      }
      return date;
    })(target, propertyKey);

    IsDate({ message: '$property must be a valid date' })(target, propertyKey);
  };
}
