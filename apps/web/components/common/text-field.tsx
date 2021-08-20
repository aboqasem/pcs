import { ChangeEventHandler, useState } from 'react';
import { BiHide, BiShow } from 'react-icons/bi';
import { HiExclamationCircle } from 'react-icons/hi';

/* eslint-disable-next-line */
export type TextFieldProps = {
  id: string;
  title: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  errors?: string[];
} & (
  | {
      type: 'password';
      autoComplete: 'new-password' | 'current-password';
    }
  | {
      type?: 'text';
      autoComplete?: 'name' | 'given-name' | 'email' | 'username';
    }
);

export function TextField({
  id,
  title,
  value,
  onChange,
  type = 'text',
  autoComplete,
  errors,
}: TextFieldProps) {
  const isPassword = type === 'password';
  const isError = Boolean(errors?.length);
  const [inputType, setInputType] = useState(type);
  const isPasswordVisible = inputType === 'text';
  const PasswordVisibilityIcon = isPasswordVisible ? BiHide : BiShow;

  const togglePasswordVisibility = () => {
    setInputType(isPasswordVisible ? 'password' : 'text');
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {title}
      </label>

      <div className="relative mt-1">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={isError}
          aria-describedby={isError ? `${id}-error` : undefined}
          className={`block w-full border rounded-md shadow-sm appearance-none focus:outline-none sm:text-sm ${
            isError
              ? 'pr-10 text-red-900 placeholder-red-300 border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'px-3 py-2 placeholder-gray-400 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
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
                  className={`w-5 h-5 ${isError ? 'text-red-600' : 'text-gray-900'}`}
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
            {errors!.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
