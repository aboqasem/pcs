import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import 'tailwindcss/tailwind.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>MyPlatform — The Programming Materials Platform</title>
        <meta name="description" content="Create, share, and attempt programming materials." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());
