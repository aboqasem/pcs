import { TPropsErrors } from '@pcs/shared-data-access';
import React, { ForwardedRef, forwardRef, memo, useState } from 'react';
import { ChangeHandler, Control, FieldValues, Path, useFormState } from 'react-hook-form';
import { BiHide, BiShow } from 'react-icons/bi';
import { HiExclamationCircle } from 'react-icons/hi';

export type TTextFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  React.HTMLProps<HTMLInputElement>,
  'name' | 'onBlur' | 'onChange' | 'autoComplete'
> & {
  name: string;
  label: string;
  onBlur: ChangeHandler;
  onChange: ChangeHandler;
  control: Control<TFieldValues>;
} & (
    | {
        password: true;
        autoComplete: 'new-password' | 'current-password';
      }
    | {
        password?: false;
        autoComplete?: 'name' | 'given-name' | 'email' | 'username';
      }
  );

export const TextField = memo(
  forwardRef(function <TFieldValues extends FieldValues = FieldValues>(
    {
      id,
      label,
      onChange,
      onBlur,
      password: isPassword,
      control,
      ...props
    }: TTextFieldProps<TFieldValues>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) {
    const name = props.name as Path<TFieldValues>;
    const {
      errors: { [name]: error },
    } = useFormState({ control, name });

    const errorMessage = (error as TPropsErrors<TFieldValues>[typeof name])?.message;
    const isError = !!errorMessage;

    const [inputType, setInputType] = useState(isPassword ? 'password' : props.type);
    const isPasswordVisible = inputType === 'text';
    const PasswordVisibilityIcon = isPasswordVisible ? BiHide : BiShow;

    const togglePasswordVisibility = () => {
      setInputType(isPasswordVisible ? 'password' : 'text');
    };

    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>

        <div className="relative mt-1">
          <input
            autoComplete="off"
            aria-invalid={isError}
            aria-describedby={isError ? `${id}-error` : undefined}
            {...props}
            ref={forwardedRef}
            id={id ?? name}
            name={name}
            type={inputType}
            onChange={onChange}
            onBlur={onBlur}
            className={`
              ${
                isError
                  ? 'px-3 py-2 pr-10 text-red-900 placeholder-red-300 border-red-300 focus:ring-red-500 focus:border-red-500 caret-red-500'
                  : 'px-3 py-2 placeholder-gray-400 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
              block w-full border rounded-md shadow-sm appearance-none focus:outline-none sm:text-sm
            `}
          />

          {(isError || isPassword) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isError && (
                <HiExclamationCircle
                  className="w-5 h-5 text-red-500 pointer-events-none"
                  aria-hidden="true"
                />
              )}
              {isPassword && (
                <button
                  type="button"
                  aria-label={`${isPasswordVisible ? 'Hide' : 'Show'} password`}
                  onClick={togglePasswordVisibility}
                >
                  <PasswordVisibilityIcon
                    className={`
                      ${isError ? 'text-red-600' : 'text-gray-900'}
                      w-5 h-5
                    `}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          )}
        </div>

        {isError && (
          <div className="mt-2 text-sm text-red-700">
            <ul id={`${id}-error`} className="pl-5 space-y-1 list-disc">
              {errorMessage.split('\n').map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }),
);

TextField.displayName = 'TextField';
