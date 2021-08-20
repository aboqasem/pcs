import * as classValidator from 'class-validator';

export function getValidationMetadataByTarget(target: Function) {
  const metadataStorage = classValidator.getMetadataStorage();

  return metadataStorage.getTargetValidationMetadatas(target, null!, false, false);
}
