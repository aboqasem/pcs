import { TReplace } from '@pcs/shared-data-access';
import { ForwardedRef, forwardRef, HTMLProps, memo, useState } from 'react';
import { ChangeHandler, Control, FieldValues, Path } from 'react-hook-form';
import { BiHide, BiShow } from 'react-icons/bi';
import { HiExclamationCircle } from 'react-icons/hi';
import { IconType } from 'react-icons/lib';
import { FormField } from './FormField';

export type TTextFieldProps<TFieldValues extends FieldValues = FieldValues> = TReplace<
  HTMLProps<HTMLInputElement>,
  {
    name: string;
    onBlur: ChangeHandler;
    onChange: ChangeHandler;
    control: Control<TFieldValues>;
  } & (
    | {
        password: true;
        autoComplete?: 'new-password' | 'current-password';
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
    )
>;

export const TextField = memo(
  forwardRef(function <TFieldValues extends FieldValues = FieldValues>(
    { label, password: isPassword, required, control, ...props }: TTextFieldProps<TFieldValues>,
    forwardedRef: ForwardedRef<HTMLInputElement>,
  ) {
    const name = props.name as Path<TFieldValues>;
    const id = props.id ?? name;
    const PlaceholderIcon = props.placeholderIcon;

    const [inputType, setInputType] = useState(isPassword ? 'password' : props.type);
    const isPasswordVisible = inputType === 'text';
    const PasswordVisibilityIcon = isPasswordVisible ? BiHide : BiShow;

    const togglePasswordVisibility = () => {
      setInputType(isPasswordVisible ? 'password' : 'text');
    };

    return (
      <FormField name={name} control={control}>
        {({ errors }) => (
          <div>
            <div className="flex justify-between">
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
              </div>

              {!required && (
                <span className="block text-sm text-gray-500" id={`${id}-optional`}>
                  Optional
                </span>
              )}
            </div>

            <div
              className={`
                 relative
                 ${label || !required ? 'mt-1' : ''}
               `}
            >
              {PlaceholderIcon && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <PlaceholderIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
              )}

              <input
                aria-invalid={!!errors}
                aria-describedby={errors ? `${id}-error` : undefined}
                {...props}
                id={id}
                ref={forwardedRef}
                name={name}
                type={inputType}
                autoComplete={props.autoComplete || 'off'}
                className={`
                    ${
                      errors
                        ? 'px-3 py-2 pr-10 text-red-900 placeholder-red-300 border-red-300 focus:ring-red-500 focus:border-red-500 caret-red-500'
                        : 'px-3 py-2 placeholder-gray-400 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }
                    ${PlaceholderIcon ? 'pl-10' : ''}
                    block w-full border rounded-md shadow-sm appearance-none focus:outline-none sm:text-sm
                  `}
              />

              {/* Right side icon for errors or actions */}
              {(errors || isPassword) && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {errors && (
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
                           ${errors ? 'text-red-600' : 'text-gray-900'}
                           w-5 h-5
                         `}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Errors list below the field */}
            {errors && (
              <div className="mt-2 text-sm text-red-700">
                <ul id={`${id}-error`} className="pl-5 space-y-1 list-disc">
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </FormField>
    );
  }),
);

TextField.displayName = 'TextField';
