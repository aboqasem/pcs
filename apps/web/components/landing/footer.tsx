import { SiFacebook, SiGithub, SiTwitter } from 'react-icons/si';
import { Link } from '../common';

/* eslint-disable-next-line */
export interface FooterProps {}

const navigation = {
  main: [
    { name: 'About', href: '#footer' },
    { name: 'Blog', href: '#footer' },
    { name: 'Jobs', href: '#footer' },
    { name: 'Press', href: '#footer' },
    { name: 'Accessibility', href: '#footer' },
    { name: 'Partners', href: '#footer' },
  ],
  social: [
    {
      name: 'Facebook',
      href: '#footer',
      icon: SiFacebook,
    },
    {
      name: 'Twitter',
      href: '#footer',
      icon: SiTwitter,
    },
    {
      name: 'GitHub',
      href: '#footer',
      icon: SiGithub,
    },
  ],
};

export default function Footer(props: FooterProps) {
  return (
    <footer id="footer" className="bg-white">
      <div className="px-4 py-12 mx-auto overflow-hidden md:py-14 lg:py-16 max-w-7xl sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center -mx-5 -my-2" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <Link href={item.href} className="text-base text-gray-500 hover:text-gray-900">
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
        <div className="flex justify-center mt-8 space-x-6">
          {navigation.social.map((item) => (
            <Link key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">{item.name}</span>
              <item.icon className="w-6 h-6" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="mt-8 text-base text-center text-gray-400">
          &copy; {new Date().getFullYear()} MyPlatform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
