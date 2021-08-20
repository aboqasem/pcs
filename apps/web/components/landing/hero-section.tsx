import { PagePath } from '@/lib/constants';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import { Link } from '../common';

/* eslint-disable-next-line */
export interface HeroSectionProps {}

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#features' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
];

export default function HeroSection(props: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gray-50">
      {/* <shapes> */}
      <div
        className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full"
        aria-hidden="true"
      >
        <div className="relative h-full mx-auto max-w-7xl">
          <svg
            className="absolute transform right-full translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
            width={404}
            height={784}
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width={404} height={784} fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
          </svg>
          <svg
            className="absolute transform left-full -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2"
            width={404}
            height={784}
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect width={404} height={784} fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)" />
          </svg>
        </div>
      </div>
      {/* </shapes> */}

      <div className="relative pt-6 pb-16 sm:pb-24 md:pb-28 lg:pb-32">
        <Popover>
          {({ open }) => (
            <>
              <div className="px-4 mx-auto max-w-7xl sm:px-6">
                <nav
                  className="relative flex items-center justify-start sm:h-10 lg:justify-center md:space-x-20"
                  aria-label="Global"
                >
                  <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                    <div className="flex items-center justify-between w-full md:w-auto">
                      <Link href="#">
                        <span className="sr-only">MyPlatform</span>
                        <img
                          className="w-auto h-8 sm:h-10"
                          src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
                          alt=""
                        />
                      </Link>
                      <div className="flex items-center -mr-2 md:hidden">
                        <Popover.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md bg-gray-50 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                          <span className="sr-only">Open main menu</span>
                          <HiMenu className="w-6 h-6" aria-hidden="true" />
                        </Popover.Button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex md:space-x-10">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="font-medium text-gray-500 hover:text-gray-900"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="hidden md:absolute md:flex md:items-center md:justify-end md:inset-y-0 md:right-0">
                    <div className="items-center justify-end hidden md:flex md:flex-1 lg:w-0">
                      <Link
                        href={PagePath.SignIn}
                        className="text-base font-medium text-gray-500 whitespace-nowrap hover:text-gray-900"
                      >
                        Sign in
                      </Link>
                      <Link
                        href={PagePath.SignUp}
                        className="inline-flex items-center justify-center px-4 py-2 ml-8 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm whitespace-nowrap hover:bg-blue-700"
                      >
                        Sign up
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="duration-150 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Popover.Panel
                  focus
                  static
                  className="absolute inset-x-0 top-0 p-2 transition origin-top-right transform md:hidden"
                >
                  <div className="overflow-hidden bg-white rounded-lg shadow-md ring-1 ring-black ring-opacity-5">
                    <div className="flex items-center justify-between px-5 pt-4">
                      <div>
                        <Link href="#">
                          <img
                            className="w-auto h-8"
                            src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
                            alt="My Platform's Logo"
                          />
                        </Link>
                      </div>
                      <div className="-mr-2">
                        <Popover.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                          <span className="sr-only">Close menu</span>
                          <HiX className="w-6 h-6" aria-hidden="true" />
                        </Popover.Button>
                      </div>
                    </div>
                    <div className="px-2 pt-2 pb-3">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                      ))}
                      <Link
                        href={PagePath.SignUp}
                        className="flex justify-center py-2 mx-3 mt-4 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                      >
                        Sign up
                      </Link>
                    </div>
                    <p className="mt-2 mb-4 text-base font-medium text-center text-gray-500">
                      Existing user?{' '}
                      <Link href={PagePath.SignIn} className="text-blue-600 hover:text-blue-500">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>

        <main className="px-4 mx-auto mt-16 max-w-7xl sm:mt-24 md:mt-28 lg:mt-36">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Create, share, and attempt</span>{' '}
              <span className="block text-blue-600 xl:inline">programming materials</span>
            </h1>
            <p className="max-w-md mx-auto mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat
              commodo. Elit sunt amet fugiat veniam occaecat fugiat aliqua.
            </p>
            <div className="max-w-md mx-auto mt-5 sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href={PagePath.SignUp}
                  className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="#"
                  className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-blue-600 bg-white border border-transparent rounded-md hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Live demo
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
