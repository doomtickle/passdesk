import { DeskDemo } from './DeskDemo';
import { WaitlistForm } from './WaitlistForm';
import './Hero.css';

const PROOF = ['Runs on your machine', 'Standard-library Python, open source', 'Works with Claude Code today'];

export function Hero() {
  return (
    <section id="top" className="hero section--dark on-dark" aria-labelledby="hero-title">
      <div className="container grid hero__inner">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--brass">Open source gateway · Apache-2.0</p>
          <h1 id="hero-title" className="hero__title">
            Let your agents work. <span className="hero__accent">Keep the keys.</span>
          </h1>
          <p className="hero__lede">
            Passdesk is the front desk for your AI coding agents. They push code, open pull requests and
            pull in packages, and Passdesk does each job with its own credentials, by your rules, on the
            record. Your agents never hold your tokens.
          </p>
          <WaitlistForm source="hero" />
          <ul className="hero__proof" aria-label="At a glance">
            {PROOF.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="hero__note">We'll only email you about Passdesk early access.</p>
        </div>
        <div className="hero__demo">
          <DeskDemo />
        </div>
      </div>
    </section>
  );
}
