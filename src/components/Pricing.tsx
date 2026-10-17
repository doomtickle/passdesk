import './Pricing.css';

const FREE = [
  'Credentials held by the desk',
  'Per-agent tool grants',
  'Branch rules, draft-only pull requests',
  'Per-commit secret scan',
  'Hash-verified npm and PyPI',
  'Audit record per call',
];

const SOLO = [
  { text: 'Everything in Free' },
  { text: 'Approvals for pushes and pull requests' },
  { text: 'Webhook notifications' },
  { text: "Approver's name on the record" },
  { text: 'Per-agent rules', soon: true },
  { text: 'Hash-chained audit export', soon: true },
];

const TEAM = [
  'Everything in Pro Solo',
  'One key for the team',
  'Shared policy reviewed like code',
  'Email support, two business days',
  'No SLA, no custom work',
  'No enterprise tier, on purpose',
];

export function Pricing() {
  return (
    <section id="pricing" className="section section--paper" aria-labelledby="pricing-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h2 id="pricing-title">The gateway is free. The approval gate is Pro.</h2>
          <p>
            Passdesk Pro holds every push and pull request until a person approves or declines it from the
            terminal, with an optional webhook to notify them, and puts the approver's name on the record.
            Annual, per approver, unlimited agents.
          </p>
        </div>

        <div className="plans">
          <div className="card card--light plan">
            <div className="plan__head">
              <h3>Passdesk</h3>
              <p className="plan__sub">Apache-2.0, forever</p>
            </div>
            <p className="plan__price">Free</p>
            <ul className="plan__list">
              {FREE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="button button--ghost plan__cta" href="#get-access">
              Get the quickstart
            </a>
          </div>

          <div className="card card--lobby plan plan--pro on-dark">
            <div className="plan__head">
              <div className="plan__title-row">
                <h3>Pro Solo</h3>
                <span className="chip chip--brass">Early access</span>
              </div>
              <p className="plan__sub">one approver, unlimited agents</p>
            </div>
            <p className="plan__price">
              $79<span className="plan__period"> / year</span>
            </p>
            <ul className="plan__list">
              {SOLO.map((item) => (
                <li key={item.text}>
                  {item.text}
                  {item.soon && <span className="plan__soon">coming</span>}
                </li>
              ))}
            </ul>
            <a className="button button--brass plan__cta" href="#get-access">
              Join the beta
            </a>
          </div>

          <div className="card card--light plan">
            <div className="plan__head">
              <h3>Pro Team</h3>
              <p className="plan__sub">up to ten approvers</p>
            </div>
            <p className="plan__price">
              $490<span className="plan__period"> / year</span>
            </p>
            <ul className="plan__list">
              {TEAM.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="button button--ink plan__cta" href="#get-access">
              Join the beta
            </a>
          </div>
        </div>

        <p className="plans__note">
          Pro is in private beta and ships in early 2027. Prices are a starting point and may change before
          launch.
        </p>
      </div>
    </section>
  );
}
