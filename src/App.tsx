import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { HowItWorks } from './components/HowItWorks';
import { Audiences } from './components/Audiences';
import { UnderTheHood } from './components/UnderTheHood';
import { Pricing } from './components/Pricing';
import { Availability } from './components/Availability';
import { Faq } from './components/Faq';
import { Closing } from './components/Closing';
import { Footer } from './components/Footer';

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Problem />
        <HowItWorks />
        <Audiences />
        <UnderTheHood />
        <Pricing />
        <Availability />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
