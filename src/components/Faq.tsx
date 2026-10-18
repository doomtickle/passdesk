import './Faq.css';

const QUESTIONS = [
  {
    q: 'Does my agent ever see my GitHub token?',
    a: "No. The gateway's own sandbox on your machine holds the credentials and makes the call itself. The agent only holds its own Passdesk token, which works only for the tools you approved.",
  },
  {
    q: 'Do you ever see my keys, my code or my record?',
    a: 'No. Passdesk is software you run on your own machine. Your credentials, your code and your audit record stay there. Nothing is sent to us.',
  },
  {
    q: "What happens when an agent asks for something it isn't allowed to do?",
    a: 'Passdesk declines it with a reason, such as “main is a protected branch”, and a hint where there is one. The decision goes on the record either way.',
  },
  {
    q: 'Can an agent go around Passdesk?',
    a: "All of an agent's tool traffic goes through Passdesk; apart from its model provider, it has no other way out.",
  },
  {
    q: 'What if a secret ends up in a push or a pull request?',
    a: "Pushes and pull requests are scanned for common secret formats, and blocked if one turns up. Text that comes back from the web or another service is cleaned and marked as untrusted. It looks for known key and token formats (GitHub, AWS, Anthropic, OpenAI, Slack, Google, private keys, password assignments). It's a safety net, not a full data-loss-prevention tool.",
  },
  {
    q: 'What do I need to run it?',
    a: 'Passdesk runs in Docker Sandboxes today; the sandbox keeps agents’ tool traffic contained and adds your GitHub token. One Passdesk serves one project, on your machine.',
  },
  {
    q: 'Will it work with Claude Code, Codex or Cursor?',
    a: 'Today it runs with Claude Code agents in Docker sandboxes and speaks MCP. Support for other MCP clients (Codex, Cursor) and setups without a shared sandbox is coming.',
  },
  {
    q: 'When can I try it?',
    a: "Request early access below and we'll send you the quickstart the day it ships.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="section section--paper" aria-labelledby="faq-title">
      <div className="container grid">
        <div className="faq__head">
          <p className="eyebrow">Questions</p>
          <h2 id="faq-title">Straight answers</h2>
        </div>
        <div className="faq">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="faq__item">
              <summary className="faq__question">
                <span>{item.q}</span>
                <span className="faq__icon" aria-hidden="true" />
              </summary>
              <div className="faq__answer">
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
