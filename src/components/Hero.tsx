import { DeskDemo } from './DeskDemo';
import { WaitlistForm } from './WaitlistForm';
import './Hero.css';

export function Hero() {
  return (
    <section id="top" className="hero section--dark on-dark" aria-labelledby="hero-title">
      <div className="container grid hero__inner">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            Let your agents work. Keep the keys.
          </h1>
          <p className="hero__lede">
            Passdesk is the front desk for your AI coding agents. They push code, open pull requests and
            pull in packages, and Passdesk does each job with its own credentials, by your rules, on the
            record. Your agents never hold your tokens.
          </p>
          <WaitlistForm source="hero" />
          <p className="hero__note">We'll only email you about Passdesk early access.</p>
        </div>
        <div className="hero__demo">
          <DeskDemo />
        </div>
      </div>
    </section>
  );
}
