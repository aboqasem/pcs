import { ChangeEventHandler } from 'react';

/* eslint-disable-next-line */
export type CheckboxProps = {
  id: string;
  title: string;
  checked: boolean | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function Checkbox({ id, title, checked, onChange }: CheckboxProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={id} className="block ml-2 text-sm text-gray-900">
          {title}
        </label>
      </div>
    </div>
  );
}
