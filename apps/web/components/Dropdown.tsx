import { classNames } from '@/lib/utils/style.utils';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, memo, MouseEventHandler } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { IconType } from 'react-icons/lib';

export interface IDropdownItem {
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface IDropdownProps {
  title: string;
  icon?: IconType | null;
  items: IDropdownItem[];
}

export const Dropdown = memo(function Dropdown({
  items,
  title,
  icon: Icon = HiChevronDown,
}: IDropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm order-0 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3">
          {title}
          {Icon && <Icon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {items.map((item) => (
              <Menu.Item key={item.label} disabled={!item.onClick}>
                {({ active, disabled }) => (
                  <button
                    onClick={item.onClick}
                    className={classNames(
                      'block px-4 py-2 text-sm w-full text-left disabled:opacity-50',
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    )}
                    disabled={disabled}
                  >
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
});
