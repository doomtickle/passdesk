import type { FormEvent } from 'react';
import './WaitlistForm.css';

// Static visual version. A later task wires up submission and its states.
export function WaitlistForm({ source }: { source: 'hero' | 'closing' }) {
  const inputId = `waitlist-email-${source}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form className={`waitlist waitlist--${source}`} onSubmit={handleSubmit}>
      <label className="waitlist__label" htmlFor={inputId}>
        Work email
      </label>
      <div className="waitlist__row">
        <input
          id={inputId}
          className="waitlist__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          required
        />
        <button className="button button--brass waitlist__button" type="submit">
          Request early access
        </button>
      </div>
    </form>
  );
}
