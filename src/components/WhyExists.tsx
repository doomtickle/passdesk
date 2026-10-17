import './WhyExists.css';

export function WhyExists() {
  return (
    <section id="why-exists" className="section section--paper-2" aria-labelledby="why-exists-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Why this exists</p>
          <h2 id="why-exists-title">An agent reading something it didn't control is how credentials leak.</h2>
          <p>
            Four security write-ups from early 2026 — about Anthropic's claude-code-action, Cline's publish
            pipeline, OpenAI Codex, and three CI-hosted coding agents — described agents leaking credentials
            after reading something they didn't control: an issue, a comment, a branch name. Three of the four
            ran inside GitHub Actions, a different environment than the one Passdesk runs in, so Passdesk's
            design doesn't answer all of them. The piece it does answer, on a developer's own machine, is the
            pattern they share: the agent never holds the credential, and every push, pull request and prompt
            is scanned for secrets before it leaves.
          </p>
        </div>
        <p className="why-exists__link">
          <a href="/why/">Read the full walkthrough of the four incidents</a>
        </p>
      </div>
    </section>
  );
}
