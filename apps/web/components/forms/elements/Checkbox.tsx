import { TReplace } from '@pcs/shared-data-access';
import { ForwardedRef, forwardRef, HTMLProps, memo } from 'react';
import { ChangeHandler, Control, FieldValues, Path } from 'react-hook-form';
import { FormField } from './FormField';

export type TCheckboxProps<TFieldValues extends FieldValues = FieldValues> = TReplace<
  HTMLProps<HTMLInputElement>,
  { name: string; label: string; onBlur: ChangeHandler; onChange: ChangeHandler }
> & {
  control: Control<TFieldValues>;
};

export const Checkbox = memo(
  forwardRef(function <TFieldValues extends FieldValues = FieldValues>(
    { label, onChange, onBlur, control, ...props }: TCheckboxProps<TFieldValues>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) {
    const name = props.name as Path<TFieldValues>;
    const id = props.id ?? name;

    return (
      <FormField name={name} control={control}>
        {() => (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...props}
                ref={forwardedRef}
                id={id}
                name={name}
                type="checkbox"
                onChange={onChange}
                onBlur={onBlur}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />

              <label htmlFor={id} className="block ml-2 text-sm text-gray-900">
                {label}
              </label>
            </div>
          </div>
        )}
      </FormField>
    );
  }),
);

Checkbox.displayName = 'Checkbox';
