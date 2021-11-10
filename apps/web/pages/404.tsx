import { Link } from '@/components/Link';
import Void from '@/public/assets/void.svg';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-col flex-grow">
        <main className="flex flex-col flex-grow bg-white lg:relative">
          <div className="flex flex-col flex-grow w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex-shrink-0 pt-10 sm:pt-16">
              <Link href="/" className="inline-flex">
                <span className="sr-only">PCS</span>
                <img
                  className="w-auto h-12"
                  src="https://tailwindui.com/img/logos/workflow-mark.svg?color=blue&shade=600"
                  alt="PCS's Logo"
                />
              </Link>
            </div>
            <div className="flex-shrink-0 py-16 my-auto sm:py-32">
              <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">
                404 error
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Page not found
              </h1>
              <p className="mt-2 text-base text-gray-500">
                Sorry, we couldn’t find the page you’re looking for.
              </p>
              <div className="mt-6">
                <Link href="/" className="text-base font-medium text-blue-600 hover:text-blue-500">
                  Go back home<span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 hidden w-1/2 m-10 lg:block">
            <div className="absolute inset-0 object-cover w-full h-full">
              <Image src={Void} alt="void, or not found" layout="fill" />
            </div>
          </div>
        </main>
        <footer className="flex-shrink-0 bg-gray-50">
          <div className="w-full px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <nav className="flex space-x-4">
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                Contact Support
              </Link>
              <span className="inline-block border-l border-gray-300" aria-hidden="true" />
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                Status
              </Link>
              <span className="inline-block border-l border-gray-300" aria-hidden="true" />
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-600">
                Twitter
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
