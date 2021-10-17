import { Globals } from '@/components';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useState } from 'react';
import { Hydrate, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import 'tailwindcss/tailwind.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new DefaultQueryClient());

  return (
    <>
      <Head>
        <title>PCS — The Programming Classwork System</title>
      </Head>

      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Globals />

          <Component {...pageProps} />

          <ReactQueryDevtools initialIsOpen={false} position={'bottom-right'} />
        </Hydrate>
      </QueryClientProvider>
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
