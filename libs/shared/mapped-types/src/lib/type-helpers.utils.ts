import * as classTransformerStorage from 'class-transformer/cjs/storage';
import * as classValidator from 'class-validator';

import { Type } from './types';

export function applyIsOptionalDecorator(targetClass: Function, propertyKey: string) {
  const decoratorFactory = classValidator.IsOptional();
  decoratorFactory(targetClass.prototype, propertyKey);
}

export function inheritValidationMetadata(
  parentClass: Type<any>,
  targetClass: Function,
  isPropertyInherited?: (key: string) => boolean,
) {
  try {
    const metadataStorage = classValidator.getMetadataStorage();
    const targetMetadata = metadataStorage.getTargetValidationMetadatas(
      parentClass,
      null!,
      false,
      false,
    );

    return targetMetadata
      .filter(({ propertyName }) => !isPropertyInherited || isPropertyInherited(propertyName))
      .map((value) => {
        const originalType = Reflect.getMetadata(
          'design:type',
          parentClass.prototype,
          value.propertyName,
        );
        if (originalType) {
          Reflect.defineMetadata(
            'design:type',
            originalType,
            targetClass.prototype,
            value.propertyName,
          );
        }

        metadataStorage.addValidationMetadata({
          ...value,
          target: targetClass,
        });
        return value.propertyName;
      });
  } catch (err) {
    console.error(
      `Validation ("class-validator") metadata cannot be inherited for "${parentClass.name}" class.`,
    );
    console.error(err);
  }

  return undefined;
}

type TransformMetadataKey =
  | '_excludeMetadatas'
  | '_exposeMetadatas'
  | '_typeMetadatas'
  | '_transformMetadatas';

export function inheritTransformationMetadata(
  parentClass: Type<any>,
  targetClass: Function,
  isPropertyInherited?: (key: string) => boolean,
) {
  try {
    const transformMetadataKeys: TransformMetadataKey[] = [
      '_excludeMetadatas',
      '_exposeMetadatas',
      '_transformMetadatas',
      '_typeMetadatas',
    ];
    transformMetadataKeys.forEach((key) =>
      inheritTransformerMetadata(key, parentClass, targetClass, isPropertyInherited),
    );
  } catch (err) {
    console.error(
      `Transformer ("class-transformer") metadata cannot be inherited for "${parentClass.name}" class.`,
    );
    console.error(err);
  }
}

function inheritTransformerMetadata(
  key: TransformMetadataKey,
  parentClass: Type<any>,
  targetClass: Function,
  isPropertyInherited?: (key: string) => boolean,
) {
  const metadataStorage = classTransformerStorage.defaultMetadataStorage;

  while (parentClass && parentClass !== Object) {
    if (metadataStorage[key].has(parentClass)) {
      const metadataMap = metadataStorage[key] as Map<Function, Map<string, any>>;
      const parentMetadata = metadataMap.get(parentClass);

      const targetMetadataEntries: Iterable<[string, any]> = Array.from(parentMetadata!.entries())
        .filter(([k]) => !isPropertyInherited || isPropertyInherited(k))
        .map(([k, metadata]) => {
          if (Array.isArray(metadata)) {
            // "_transformMetadatas" is an array of elements
            const targetMetadata = metadata.map((item) => ({
              ...item,
              target: targetClass,
            }));
            return [k, targetMetadata];
          }
          return [k, { ...metadata, target: targetClass }];
        });

      if (metadataMap.has(targetClass)) {
        const existingRules = metadataMap.get(targetClass)!.entries();
        metadataMap.set(targetClass, new Map([...existingRules, ...targetMetadataEntries]));
      } else {
        metadataMap.set(targetClass, new Map(targetMetadataEntries));
      }
    }
    parentClass = Object.getPrototypeOf(parentClass);
  }
}

export function inheritPropertyInitializers(
  target: Record<string, any>,
  sourceClass: Type<any>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPropertyInherited = (key: string) => true,
) {
  try {
    const tempInstance = new sourceClass();
    const propertyNames = Object.getOwnPropertyNames(tempInstance);

    propertyNames
      .filter(
        (propertyName) =>
          typeof tempInstance[propertyName] !== 'undefined' &&
          typeof target[propertyName] === 'undefined',
      )
      .filter((propertyName) => isPropertyInherited(propertyName))
      .forEach((propertyName) => {
        target[propertyName] = tempInstance[propertyName];
      });
    // eslint-disable-next-line no-empty
  } catch {}
}
