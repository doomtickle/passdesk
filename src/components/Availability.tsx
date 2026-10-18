import './Availability.css';

const TODAY = [
  'GitHub (fetch, push, open pull requests)',
  'Packages from npm and PyPI',
  'Web pages from hosts you allow',
];

const TODAY_NOTE =
  "Pull requests open as drafts by default; force-pushes and branch deletion aren't possible.";

const NEXT = [
  'Any MCP client (Codex, Cursor and others), outside Docker sandboxes',
  'Per-agent rules, not just a shared tool grant',
  'Tamper-evident logs you can stream to your SIEM',
  'Short-lived GitHub tokens scoped to one repo',
  'Human approval for risky actions',
  'Signed policy bundles and an admin API',
];

export function Availability() {
  return (
    <section id="availability" className="section section--paper-2" aria-labelledby="availability-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Availability</p>
          <h2 id="availability-title">What works today, and what's next</h2>
        </div>
        <div className="availability">
          <div className="availability__group">
            <h3 id="works-today">Works today</h3>
            <ul className="availability__list availability__list--today" aria-labelledby="works-today">
              {TODAY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="availability__flex">
              <strong>Only what you turn on.</strong> Each agent gets the tools you grant it and nothing else.
              Start with GitHub and your package registries, and add an integration when an agent needs one: for
              example, reading issues from Jira, or asking Gemini. Anything you don't set up stays off.
            </p>
            <p className="availability__note">{TODAY_NOTE}</p>
          </div>
          <div className="availability__group">
            <h3 id="coming-soon">Coming soon</h3>
            <ul className="availability__list availability__list--next" aria-labelledby="coming-soon">
              {NEXT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
