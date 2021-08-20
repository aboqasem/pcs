import CtaSection from '@/components/landing/cta-section';
import FeaturesSection from '@/components/landing/features-section';
import Footer from '@/components/landing/footer';
import HeroSection from '@/components/landing/hero-section';
import { PagePath } from '@/lib/constants';
import { redirectIf } from '@/lib/services/auth.service';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

export default function Index(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (ctx) => {
  const redirectAndUser = await redirectIf(ctx, {
    auth: PagePath.Dashboard,
  });
  if (redirectAndUser[0]) {
    return { redirect: redirectAndUser[0] };
  }

  return {
    props: {},
  };
};
