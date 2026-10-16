import { KeyMark } from './KeyMark';
import './Problem.css';

const ROWS = [
  {
    label: 'Who holds the credentials',
    without: 'The agent',
    with: "Passdesk, which uses them on the agent's behalf",
  },
  {
    label: 'Where the agent can connect',
    without: 'Anywhere on the internet',
    with: 'Only to Passdesk; apart from its model provider, it has no other way out',
  },
  {
    label: "What it's allowed to do",
    without: 'Whatever the token allows',
    with: 'Only the tools you approved, within your rules',
  },
  {
    label: 'What you can see afterwards',
    without: 'Only what each service happens to log',
    with: 'Every call, with its decision',
  },
];

export function Problem() {
  return (
    <section id="problem" className="section section--paper" aria-labelledby="problem-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">The problem</p>
          <h2 id="problem-title">Today, an agent that can push code holds the key to your repo.</h2>
          <p>
            To let an agent do real work, teams hand it a token. That token sits in the agent's
            environment, works from anywhere on the internet, and leaves you no record of what the agent asked for.
            If the agent is tricked by something it reads, the token goes wherever it's told.
          </p>
        </div>

        <div className="compare">
          <div className="card compare__card compare__card--without">
            <p className="chip chip--no-light compare__badge">Without Passdesk</p>
            <dl className="compare__list">
              {ROWS.map((row) => (
                <div key={row.label} className="compare__row">
                  <dt>{row.label}</dt>
                  <dd>{row.without}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card card--lobby compare__card compare__card--with on-dark">
            <p className="chip chip--brass compare__badge">
              <KeyMark size={16} />
              With Passdesk
            </p>
            <dl className="compare__list">
              {ROWS.map((row) => (
                <div key={row.label} className="compare__row">
                  <dt>{row.label}</dt>
                  <dd>{row.with}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
