import './Availability.css';

const TODAY = ['GitHub (fetch, push, open pull requests)', 'npm', 'PyPI', 'Web fetch', 'Jira', 'Gemini'];

const NEXT = [
  'A generic adapter for any MCP agent, including Claude Code, Codex and Cursor',
  'Tamper-evident logs you can stream to your SIEM',
  'Short-lived GitHub tokens scoped to one repo',
  'Human approval for risky actions',
  'Signed policy bundles and an admin API',
];

export function Availability() {
  return (
    <section id="availability" className="section section--white" aria-labelledby="availability-title">
      <div className="container">
        <div className="section-head">
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
