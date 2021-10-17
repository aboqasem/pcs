import { DetailedHTMLProps, ForwardedRef, forwardRef, InputHTMLAttributes, memo } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

export type TCheckboxProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  UseFormRegisterReturn & {
    label: string;
  };

export const Checkbox = memo(
  forwardRef(function (
    { id, name, label, onChange, onBlur, ...props }: TCheckboxProps,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            {...props}
            ref={forwardedRef}
            id={id ?? name}
            name={name}
            type="checkbox"
            onChange={onChange}
            onBlur={onBlur}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={id ?? name} className="block ml-2 text-sm text-gray-900">
            {label}
          </label>
        </div>
      </div>
    );
  }),
);

Checkbox.displayName = 'Checkbox';
