'use client';

import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import Demo from '@/components/landing/demo';
import UseCases from '@/components/landing/use-cases';
import Testimonials from '@/components/landing/testimonials';
import Pricing from '@/components/landing/pricing';
import Faq from '@/components/landing/faq';
import Contact from '@/components/landing/contact';
import Footer from '@/components/landing/footer';
import CompanyProfile from '@/components/landing/company-profile';
import { AppProvider } from '@/context/app-context';
import ScrollToTop from '@/components/landing/scroll-to-top';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Features />
          <Demo />
          <UseCases />
          <Testimonials />
          <Pricing />
          <Faq />
          <Contact />
          <CompanyProfile />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </AppProvider>
  );
}
