import { useId, useRef, useState, type FormEvent } from 'react';
import { CONTACT_EMAIL } from '../config';
import { submitWaitlist, type WaitlistResult } from '../lib/waitlist';
import { KeyMark } from './KeyMark';
import './WaitlistForm.css';

type Status = 'idle' | 'submitting' | 'success';
type ErrorReason = Exclude<WaitlistResult, { ok: true }>['reason'];

function getEndpoint(): string | undefined {
  return import.meta.env.VITE_WAITLIST_ENDPOINT;
}

let warnedNotConfigured = false;

export function WaitlistForm({ source }: { source: 'hero' | 'closing' }) {
  const idPrefix = useId();
  const emailId = `${idPrefix}-email`;
  const companyId = `${idPrefix}-company`;
  const websiteId = `${idPrefix}-website`;
  const errorId = `${idPrefix}-error`;

  const emailRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<ErrorReason | null>(null);
  const [sentEmail, setSentEmail] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '');
    const company = String(data.get('company') ?? '');
    const honeypot = String(data.get('website') ?? '');

    setStatus('submitting');
    setError(null);

    const result = await submitWaitlist({
      endpoint: getEndpoint(),
      email,
      company: company || undefined,
      source,
      honeypot,
    });

    if (result.ok) {
      setSentEmail(email.trim());
      setStatus('success');
      requestAnimationFrame(() => successRef.current?.focus());
      return;
    }

    if (result.reason === 'not_configured' && import.meta.env.DEV && !warnedNotConfigured) {
      warnedNotConfigured = true;
      console.warn(
        'Waitlist sign-up is not connected: set VITE_WAITLIST_ENDPOINT in .env.local to a form endpoint (see .env.example).',
      );
    }

    setStatus('idle');
    setError(result.reason);
    emailRef.current?.focus();
  };

  if (status === 'success') {
    return (
      <div className={`waitlist waitlist--${source} waitlist__success`} ref={successRef} tabIndex={-1}>
        <p className="waitlist__success-heading">
          <KeyMark size={22} className="waitlist__success-mark" />
          Request received.
        </p>
        <p className="waitlist__success-text">We&rsquo;ll email {sentEmail} when early access opens.</p>
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form className={`waitlist waitlist--${source}`} onSubmit={handleSubmit} noValidate>
      <label className="waitlist__label" htmlFor={emailId}>
        Work email
      </label>
      <div className="waitlist__row">
        <input
          ref={emailRef}
          id={emailId}
          className="waitlist__input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={isSubmitting}
        />
        <button className="button button--brass waitlist__button" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Request early access'}
        </button>
      </div>
      <div className="waitlist__company-row">
        <label className="waitlist__label waitlist__label--company" htmlFor={companyId}>
          Company (optional)
        </label>
        <input
          id={companyId}
          className="waitlist__input waitlist__input--company"
          type="text"
          name="company"
          autoComplete="organization"
          placeholder="Acme"
          disabled={isSubmitting}
        />
      </div>
      <input
        id={websiteId}
        className="waitlist__honeypot"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="waitlist__status" aria-live="polite">
        {error && (
          <p className="waitlist__error" id={errorId}>
            {renderError(error)}
          </p>
        )}
      </div>
    </form>
  );
}

function renderError(reason: ErrorReason) {
  switch (reason) {
    case 'invalid_email':
      return 'Enter an email address like name@company.com.';
    case 'network':
      return "Couldn't send your request. Check your connection and try again.";
    case 'server':
      return (
        <>
          Couldn&rsquo;t send your request. Try again, or email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </>
      );
    case 'not_configured':
      return (
        <>
          Sign-up isn&rsquo;t connected yet. Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to request
          early access.
        </>
      );
  }
}
