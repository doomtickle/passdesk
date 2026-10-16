import './DeskDemo.css';

type Decision = 'Approved' | 'Declined';

interface Ticket {
  agent: string;
  request: string;
  decision: Decision;
  reason?: string;
}

interface RecordLine {
  time: string;
  agent: string;
  action: string;
  decision: Decision;
}

const TICKETS: Ticket[] = [
  { agent: 'release-bot', request: 'Push branch agent/bump-deps to acme/web', decision: 'Approved' },
  {
    agent: 'triage-bot',
    request: 'Push straight to main on acme/web',
    decision: 'Declined',
    reason: 'main is a protected branch',
  },
  { agent: 'pkg-bot', request: 'Fetch @acme/ui-kit 2.4.1 from npm', decision: 'Approved' },
];

const RECORD: RecordLine[] = [
  { time: '09:12', agent: 'release-bot', action: 'Push agent/bump-deps', decision: 'Approved' },
  { time: '09:14', agent: 'triage-bot', action: 'Push main', decision: 'Declined' },
  { time: '09:21', agent: 'pkg-bot', action: 'Fetch @acme/ui-kit 2.4.1', decision: 'Approved' },
];

const KEYS = ['GitHub', 'npm', 'PyPI', 'Jira', 'Web', 'Gemini'];

// Static layout of the hero "desk". A later task animates it.
export function DeskDemo() {
  return (
    <figure className="desk">
      <div className="desk__panel">
        <div className="desk__agents">
          <div className="desk__zone-head">
            <p className="desk__zone-label">Agents</p>
            <span className="desk__chip">No keys</span>
          </div>
          <ol className="desk__tickets">
            {TICKETS.map((ticket) => (
              <li key={ticket.agent} className="ticket">
                <div className="ticket__body">
                  <p className="ticket__agent">{ticket.agent}</p>
                  <p className="ticket__request">{ticket.request}</p>
                  {ticket.reason && <p className="ticket__reason">{ticket.reason}</p>}
                </div>
                <span className={`stamp stamp--${ticket.decision.toLowerCase()}`}>{ticket.decision}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="desk__rack">
          <p className="desk__zone-label">Keys stay at the desk</p>
          <ul className="rack">
            {KEYS.map((key) => (
              <li key={key} className="key-tag">
                {key}
              </li>
            ))}
          </ul>
        </div>

        <div className="desk__record">
          <p className="desk__zone-label">On the record</p>
          <ol className="record">
            {RECORD.map((line) => (
              <li key={line.time} className="record__line">
                <span className="record__time">{line.time}</span>
                <span className="record__agent">{line.agent}</span>
                <span className="record__action">{line.action}</span>
                <span className={`record__decision record__decision--${line.decision.toLowerCase()}`}>
                  {line.decision}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption className="desk__caption">Illustration: requests going through Passdesk</figcaption>
    </figure>
  );
}
