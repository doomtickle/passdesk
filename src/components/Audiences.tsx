import './Audiences.css';

export function Audiences() {
  return (
    <section id="audiences" className="section section--paper" aria-labelledby="audiences-title">
      <div className="container">
        <div className="section-head">
          <h2 id="audiences-title">Built for the people who ship and the people who sign off</h2>
        </div>
        <div className="audiences">
          <div className="audience">
            <h3>For engineering</h3>
            <p>
              Agents keep doing real work: fetch and push code, open pull requests, pull packages from npm and
              PyPI, and read the web. When something is off-limits, the agent hears why and can take the
              allowed route.
            </p>
          </div>
          <div className="audience">
            <h3>For security</h3>
            <p>
              Approve each agent's tools once, in a config file that's reviewed like any other code change.
              Then see every call: when, which agent, which tool, the arguments with secrets redacted, and the
              decision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
