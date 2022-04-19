import { classNames } from '@/lib/utils/style.utils';
import { Listbox, Transition } from '@headlessui/react';
import { TReplace } from '@pcs/shared-data-access';
import { Fragment, HTMLProps, memo, useCallback, useEffect } from 'react';
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UnpackNestedValue,
  useController,
} from 'react-hook-form';
import { HiCheck, HiSelector } from 'react-icons/hi';
import { FormField } from './FormField';

export type TSelectMenuProps<TFieldValues extends FieldValues = FieldValues> = TReplace<
  HTMLProps<HTMLSelectElement>,
  {
    name: string;
    label: string;
    defaultValue?: string;
    onBlur?: never;
    onChange?: never;
  }
> & {
  options?: Record<string, string>;
  control: Control<TFieldValues>;
};

export const SelectMenu = memo(function <TFieldValues extends FieldValues = FieldValues>({
  label,
  options,
  defaultValue = '',
  control,
  ...props
}: TSelectMenuProps<TFieldValues>) {
  const name = props.name as Path<TFieldValues>;
  const id = props.id ?? name;
  const optionsKeys = Object.keys(options ?? {});

  const { field } = useController({
    name,
    control,
    defaultValue: defaultValue as UnpackNestedValue<PathValue<TFieldValues, Path<TFieldValues>>>,
  });

  const onChange = useCallback(
    (value: string) => {
      field.onChange(value);
    },
    [field],
  );

  useEffect(() => {
    if (optionsKeys.length && (!field.value || !optionsKeys.includes(field.value))) {
      onChange(optionsKeys[0]!);
    }
  }, [options, field, optionsKeys, onChange]);

  return (
    <FormField name={name} control={control}>
      {() => (
        <Listbox
          as="div"
          id={id}
          onBlur={field.onBlur}
          value={field.value}
          onChange={onChange}
          disabled={!optionsKeys.length}
        >
          <div className="flex justify-between">
            <Listbox.Label className="block text-sm font-medium text-gray-700">
              {label}
            </Listbox.Label>
          </div>

          <div className="relative mt-1">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <span className="block truncate">{options?.[field.value ?? ''] ?? 'Select'}</span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <HiSelector className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {Object.entries(options ?? {}).map(([value, title]) => (
                  <Listbox.Option
                    key={value}
                    className={({ active }) => `
                    ${active ? 'text-white bg-blue-600' : 'text-gray-900'}
                    cursor-default select-none relative py-2 pl-3 pr-9
                  `}
                    value={value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            'block truncate',
                            selected ? 'font-semibold' : 'font-normal',
                          )}
                        >
                          {title}
                        </span>

                        {selected && (
                          <span
                            className={classNames(
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                              active ? 'text-white' : 'text-blue-600',
                            )}
                          >
                            <HiCheck className="w-5 h-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    </FormField>
  );
});

SelectMenu.displayName = 'SelectMenu';
