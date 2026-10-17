import './ProApprovals.css';

export function ProApprovals() {
  return (
    <section id="pro-approvals" className="section section--paper-2 pro-approvals" aria-labelledby="pro-approvals-title">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Passdesk Pro</p>
          <div className="pro-approvals__title-row">
            <h2 id="pro-approvals-title">What a held push looks like</h2>
            <span className="chip chip--brass-light">Early access</span>
          </div>
        </div>

        <div className="pro-approvals__panels">
          <div className="pro-approvals__panel">
            <h3>To the agent</h3>
            <p>
              An agent&rsquo;s push or pull request waits for a decision instead of failing outright. Decided
              quickly enough, the agent gets the outcome in that same call: approved, the push or pull request
              goes through; declined, it gets the approver&rsquo;s reason. Still undecided after a short hold,
              the call ends in a denial that names the approval and asks the agent to retry once someone has
              decided; nothing is sent until then, and the retry picks up whatever was decided in the meantime.
            </p>
          </div>
          <div className="pro-approvals__panel">
            <h3>To the approver</h3>
            <p>
              The approver sees the same push as a card in their terminal: for a push, the repo and branch,
              the commit and file counts and the diff stat; for a pull request, the repo, its title and base
              branch. Because Passdesk&rsquo;s secret scan runs before the hold, every card the approver sees
              has already passed it. An optional webhook can post a summary of the card to Slack, Discord or
              ntfy, so the approver doesn&rsquo;t have to watch the terminal. One decision, approve or decline,
              goes on the audit record together with the approver&rsquo;s name; a card nobody decides on simply
              expires.
            </p>
          </div>
        </div>

        <p className="pro-approvals__note">Pro is in private beta and ships in early 2027.</p>
      </div>
    </section>
  );
}
