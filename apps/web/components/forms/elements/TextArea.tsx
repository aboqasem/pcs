import { classNames } from '@/lib/utils/style.utils';
import { TReplace } from '@pcs/shared-data-access';
import { ForwardedRef, forwardRef, HTMLProps, memo } from 'react';
import { ChangeHandler, Control, FieldValues, Path } from 'react-hook-form';
import { HiExclamationCircle } from 'react-icons/hi';
import { IconType } from 'react-icons/lib';
import { FormField } from './FormField';

export type TTextAreaProps<TFieldValues extends FieldValues = FieldValues> = TReplace<
  HTMLProps<HTMLTextAreaElement>,
  {
    name: string;
    onBlur: ChangeHandler;
    onChange: ChangeHandler;
    control: Control<TFieldValues>;
  } & (
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

export const TextArea = memo(
  forwardRef(function <TFieldValues extends FieldValues = FieldValues>(
    { label, required, control, ...props }: TTextAreaProps<TFieldValues>,
    forwardedRef: ForwardedRef<HTMLTextAreaElement>,
  ) {
    const name = props.name as Path<TFieldValues>;
    const id = props.id ?? name;

    return (
      <FormField name={name} control={control}>
        {({ errors }) => (
          <div>
            <div className="flex justify-between">
              <div>
                <label
                  htmlFor={id}
                  className={classNames(
                    'block text-sm font-medium text-gray-700',
                    !label && 'sr-only',
                  )}
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

            <div className={classNames('relative', (label || !required) && 'mt-1')}>
              {props.placeholderIcon && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <props.placeholderIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
              )}

              <textarea
                aria-invalid={!!errors}
                aria-describedby={errors ? `${id}-error` : undefined}
                {...props}
                id={id}
                rows={props.rows ?? 3}
                ref={forwardedRef}
                name={name}
                autoComplete={props.autoComplete || 'off'}
                className={classNames(
                  'block w-full border rounded-md shadow-sm appearance-none focus:outline-none sm:text-sm',
                  errors
                    ? 'px-3 py-2 pr-10 text-red-900 placeholder-red-300 border-red-300 focus:ring-red-500 focus:border-red-500 caret-red-500'
                    : 'px-3 py-2 placeholder-gray-400 border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                  props.placeholderIcon && 'pl-10',
                )}
              />

              {/* Right side icon for errors or actions */}
              {errors && (
                <div className="absolute top-0 right-0 pt-2 mr-3">
                  <HiExclamationCircle
                    className="w-5 h-5 text-red-500 pointer-events-none"
                    aria-hidden="true"
                  />
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

TextArea.displayName = 'TextArea';
