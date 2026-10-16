import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import './UnderTheHood.css';

type TabId = 'rules' | 'record';

const TABS: { id: TabId; label: string }[] = [
  { id: 'rules', label: 'The rules' },
  { id: 'record', label: 'The record' },
];

// Hand-tinted copy of the example rules file. Keep values in sync with COPY-NOTES.md.
function RulesFile() {
  const c = (text: string) => <span className="tok-comment">{text}</span>;
  const s = (text: string) => <span className="tok-string">{text}</span>;
  const k = (text: string) => <span className="tok-key">{text}</span>;
  return (
    <code>
      {c('# grants/release-bot.yaml')}
      {'\n'}
      {k('agent')}: release-bot{'\n'}
      {k('tools')}:{'\n'}
      {'  '}
      {k('github')}:{'\n'}
      {'    '}
      {k('repos')}: [{s('"acme/web"')}, {s('"acme/api"')}]{'\n'}
      {'    '}
      {k('branches')}:{'\n'}
      {'      '}
      {k('protected')}: [{s('"main"')}, {s('"release/*"')}]{'  '}
      {c('# org policy, shown inline')}
      {'\n'}
      {'      '}
      {k('push_prefix')}: {s('"agent/"')}
      {'\n'}
      {'    '}
      {k('actions')}: [fetch, push, open_pr]{'\n'}
      {'    '}
      {k('max_push_mb')}: 20{'\n'}
      {'  '}
      {k('npm')}:{'\n'}
      {'    '}
      {k('allow')}: [{s('"@acme/*"')}]{'\n'}
      {'    '}
      {k('deny')}: [{s('"@acme/legacy-auth"')}]{'\n'}
      {'  '}
      {k('web_fetch')}:{'\n'}
      {'    '}
      {k('hosts')}: [{s('"docs.acme.internal"')}, {s('"wiki.acme.internal"')}]{'\n'}
      {'    '}
      {k('max_response_mb')}: 5
    </code>
  );
}

// A hand-written sample audit record (not captured output), column-aligned by hand.
const RECORD_LINES: { text: string; decision: string; redacted?: boolean }[] = [
  {
    text: '2026-03-04T09:12:01Z  agent=release-bot    tool=github.push     args={repo: "acme/web", branch: "agent/bump-deps"}                ',
    decision: 'decision=ALLOW',
  },
  {
    text: '2026-03-04T09:12:04Z  agent=release-bot    tool=github.open_pr  args={repo: "acme/web", title: "Bump deps"}                       ',
    decision: 'decision=ALLOW',
  },
  {
    text: '2026-03-04T09:13:51Z  agent=release-bot    tool=github.push     args={repo: "acme/web", branch: "agent/fix-ci"}                   ',
    decision: 'decision=DENY  reason="secret detected in diff"',
  },
  {
    text: '2026-03-04T09:14:22Z  agent=triage-bot     tool=github.push     args={repo: "acme/web", branch: "main"}                           ',
    decision: 'decision=DENY  reason="protected branch"',
  },
  {
    text: '2026-03-04T09:15:40Z  agent=triage-bot     tool=jira.comment    args={issue: "OPS-204", body: [REDACTED]}                         ',
    decision: 'decision=ALLOW',
    redacted: true,
  },
  {
    text: '2026-03-04T09:21:08Z  agent=pkg-bot        tool=npm.fetch       args={package: "@acme/ui-kit@2.4.1"}                              ',
    decision: 'decision=ALLOW',
  },
];

function RecordFile() {
  return (
    <code>
      {RECORD_LINES.map((line) => {
        const denied = line.decision.startsWith('decision=DENY');
        let text: ReactNode = line.text;
        if (line.redacted) {
          const [before, after] = line.text.split('[REDACTED]');
          text = (
            <>
              {before}
              <span className="tok-redacted">[REDACTED]</span>
              {after}
            </>
          );
        }
        return (
          <span key={line.text} className={`log-line${denied ? ' log-line--deny' : ''}`}>
            {text}
            <span className={denied ? 'tok-deny' : 'tok-allow'}>{line.decision}</span>
            {'\n'}
          </span>
        );
      })}
    </code>
  );
}

function CodePanel({ label, caption, children }: { label: string; caption: string; children: ReactNode }) {
  return (
    <figure className="code-figure">
      <pre className="code-panel" tabIndex={0} role="region" aria-label={label}>
        {children}
      </pre>
      <figcaption className="code-figure__caption">{caption}</figcaption>
    </figure>
  );
}

export function UnderTheHood() {
  const [active, setActive] = useState<TabId>('rules');
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ rules: null, record: null });

  const select = (id: TabId) => {
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((tab) => tab.id === active);
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(TABS[next].id);
  };

  return (
    <section id="under-the-hood" className="section hood on-dark" aria-labelledby="hood-title">
      <div className="container">
        <div className="section-head">
          <h2 id="hood-title">See what your security team will see</h2>
          <p>Two files show how it works: the rules an agent works under, and the record of what it did.</p>
        </div>

        <div className="tabs" role="tablist" aria-label="Example files" onKeyDown={onKeyDown}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              className="tabs__tab"
              aria-selected={active === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div id="panel-rules" role="tabpanel" aria-labelledby="tab-rules" className="tabs__panel" hidden={active !== 'rules'}>
          <p className="tabs__intro">One file per agent, kept in version control. Change it, review it, merge it.</p>
          <CodePanel label="Example rules file" caption="Example rules file (illustrative, schema simplified)">
            <RulesFile />
          </CodePanel>
        </div>

        <div id="panel-record" role="tabpanel" aria-labelledby="tab-record" className="tabs__panel" hidden={active !== 'record'}>
          <p className="tabs__intro">Every call gets one line: time, agent, tool, redacted arguments and the decision.</p>
          <CodePanel label="Sample record" caption="Sample record (illustrative, not captured output)">
            <RecordFile />
          </CodePanel>
        </div>
      </div>
    </section>
  );
}
