import { TPropsErrors } from '@pcs/shared-data-access';
import { ForwardedRef, forwardRef, HTMLProps, memo, useState } from 'react';
import { ChangeHandler, Control, FieldValues, Path, useFormState } from 'react-hook-form';
import { BiHide, BiShow } from 'react-icons/bi';
import { HiExclamationCircle } from 'react-icons/hi';
import { IconType } from 'react-icons/lib';

export type TTextFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  HTMLProps<HTMLInputElement>,
  'name' | 'onBlur' | 'onChange' | 'autoComplete' | 'placeholder'
> & {
  name: string;
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
  ) &
  (
    | {
        label: string;
        placeholder?: never;
        placeholderIcon?: never;
      }
    | {
        label?: never;
        placeholder: string;
        placeholderIcon?: IconType;
      }
  );

export const TextField = memo(
  forwardRef(function <TFieldValues extends FieldValues = FieldValues>(
    { label, password: isPassword, control, ...props }: TTextFieldProps<TFieldValues>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) {
    const name = props.name as Path<TFieldValues>;
    const id = props.id ?? name;
    const PlaceholderIcon = props.placeholderIcon;

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
        <label
          htmlFor={id}
          className={`
            block text-sm font-medium text-gray-700
            ${label ? '' : 'sr-only'}
          `}
        >
          {label ?? props.placeholder}
        </label>

        <div
          className={`
            relative
            ${label ? 'mt-1' : ''}
          `}
        >
          {PlaceholderIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <PlaceholderIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </div>
          )}

          <input
            autoComplete="off"
            aria-invalid={isError}
            aria-describedby={isError ? `${id}-error` : undefined}
            {...props}
            id={id}
            ref={forwardedRef}
            name={name}
            type={inputType}
            className={`
              ${
                isError
                  ? 'px-3 py-2 pr-10 text-red-900 placeholder-red-300 border-red-300 focus:ring-red-500 focus:border-red-500 caret-red-500'
                  : 'px-3 py-2 placeholder-gray-400 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }
              ${PlaceholderIcon ? 'pl-10' : ''}
              block w-full border rounded-md shadow-sm appearance-none focus:outline-none sm:text-sm
            `}
          />

          {/* Right side icon for errors or actions */}
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

        {/* Error text below te field */}
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
