import { PagePath } from '@/lib/constants';
import { Link } from '../common';

/* eslint-disable-next-line */
export interface CtaSectionProps {}

export default function CtaSection(props: CtaSectionProps) {
  return (
    <section id="cta" className="bg-blue-700">
      <div className="max-w-2xl px-4 py-16 mx-auto text-center sm:py-20 md:py-24 lg:py-28 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Boost your productivity.</span>
          <span className="block">Start using MyPlatform today.</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-blue-200">
          Ac euismod vel sit maecenas id pellentesque eu sed consectetur. Malesuada adipiscing
          sagittis vel nulla nec.
        </p>
        <Link
          href={PagePath.SignUp}
          className="inline-flex items-center justify-center w-full px-5 py-3 mt-8 text-base font-medium text-blue-600 bg-white border border-transparent rounded-md hover:bg-blue-50 sm:w-auto"
        >
          Sign up for free
        </Link>
      </div>
    </section>
  );
}
