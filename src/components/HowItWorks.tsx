import './HowItWorks.css';

const STEPS = [
  {
    title: 'Your agent asks',
    body: '“Push my branch.” “Fetch this package.” The agent asks Passdesk using its own Passdesk token, never your credentials.',
  },
  {
    title: 'Passdesk checks your rules',
    body: 'Which repos, which branches, which packages, which websites. Anything outside them is declined, with a reason the agent can act on.',
  },
  {
    title: 'Passdesk does the job',
    body: 'It uses its own credentials, so they never reach the agent. npm packages are pinned to your lockfile and hash-checked; Python wheels must be pinned to exact versions with hashes. No install scripts run in Passdesk.',
  },
  {
    title: 'Passdesk checks the result and writes it down',
    body: 'Pushes, pull requests and prompts sent to Gemini are scanned for common secret formats, and blocked if one turns up. Text that comes back from the web, Jira or Gemini is cleaned and marked as untrusted. Every call goes on the record.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section section--white" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <h2 id="how-title">How a request goes through the desk</h2>
        </div>

        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="step">
              <span className="step__number" aria-hidden="true">
                {index + 1}
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__body">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="refusal grid">
          <div className="refusal__copy">
            <h3>When the answer is no</h3>
            <p>An agent tries to push straight to main. Passdesk declines and tells it what to do instead.</p>
          </div>
          <figure className="refusal__exchange">
            <dl className="exchange">
              <div className="exchange__turn">
                <dt>Agent</dt>
                <dd>Push to main on acme/web</dd>
              </div>
              <div className="exchange__turn exchange__turn--declined">
                <dt>Passdesk</dt>
                <dd>
                  <strong>Declined:</strong> main is a protected branch. Push to a branch starting with agent/
                  instead.
                </dd>
              </div>
            </dl>
            <figcaption className="refusal__caption">Illustration</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
