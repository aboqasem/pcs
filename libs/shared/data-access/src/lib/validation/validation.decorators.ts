import { SetMetadata } from '../shared/shared.decorators';
import { TCustomDecorator } from '../shared/shared.types';

export const FILTER_DISABLED_CONSTRAINTS_KEY = 'FILTER_DISABLED_CONSTRAINTS';
/**
 * We added this to filter error constraints by the `enabled` function in `context`.
 */
export const FilterDisabledConstraints = (value = true): TCustomDecorator<string> =>
  SetMetadata(FILTER_DISABLED_CONSTRAINTS_KEY, value);
