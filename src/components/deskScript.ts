// Copy for the hero desk animation (DeskDemo). Edit requests, decisions and
// record lines here; the timeline in src/lib/deskTimeline.ts plays them in order.

export type Decision = 'Approved' | 'Declined';

export const RACK_KEYS = ['GitHub', 'npm', 'PyPI', 'Web'] as const;

export type RackKey = (typeof RACK_KEYS)[number];

export interface DeskTicket {
  agent: string;
  /** Text on the slip. */
  request: string;
  /** The request as a phrase after "asks to", for the screen reader list. */
  ask: string;
  decision: Decision;
  /** Shown on declined slips after the stamp. */
  reason?: string;
  /** The key tag on the rack that does this job. */
  key: RackKey;
  /** Tool name in the record line. */
  tool: string;
  /** Time in the record line. */
  time: string;
}

export const DESK_SCRIPT: readonly DeskTicket[] = [
  {
    agent: 'release-bot',
    request: 'Push branch agent/bump-deps to acme/web',
    ask: 'push branch agent/bump-deps to acme/web',
    decision: 'Approved',
    key: 'GitHub',
    tool: 'github.push',
    time: '09:12',
  },
  {
    agent: 'release-bot',
    request: 'Open a pull request: Bump deps',
    ask: 'open a pull request called Bump deps',
    decision: 'Approved',
    key: 'GitHub',
    tool: 'github.open_pr',
    time: '09:12',
  },
  {
    agent: 'release-bot',
    request: 'Push branch agent/fix-ci to acme/web',
    ask: 'push branch agent/fix-ci to acme/web',
    decision: 'Declined',
    reason: 'A secret turned up in the changes',
    key: 'GitHub',
    tool: 'github.push',
    time: '09:13',
  },
  {
    agent: 'triage-bot',
    request: 'Push straight to main on acme/web',
    ask: 'push straight to main on acme/web',
    decision: 'Declined',
    reason: 'main is a protected branch. Use a branch starting with agent/',
    key: 'GitHub',
    tool: 'github.push',
    time: '09:14',
  },
  {
    agent: 'triage-bot',
    request: 'Fetch acme/api from GitHub',
    ask: 'fetch acme/api from GitHub',
    decision: 'Approved',
    key: 'GitHub',
    tool: 'github.fetch',
    time: '09:15',
  },
  {
    agent: 'pkg-bot',
    request: 'Fetch @acme/ui-kit 2.4.1 from npm',
    ask: 'fetch @acme/ui-kit 2.4.1 from npm',
    decision: 'Approved',
    key: 'npm',
    tool: 'npm.fetch',
    time: '09:21',
  },
];

/** One sentence per request, e.g. "release-bot asks to push branch agent/bump-deps to acme/web: approved." */
export function describeTicket(ticket: DeskTicket): string {
  const sentence = `${ticket.agent} asks to ${ticket.ask}: ${ticket.decision.toLowerCase()}.`;
  return ticket.reason ? `${sentence} ${ticket.reason}.` : sentence;
}
