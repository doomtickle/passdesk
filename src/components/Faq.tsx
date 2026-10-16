import './Faq.css';

const QUESTIONS = [
  {
    q: 'Does my agent ever see my GitHub token?',
    a: 'No. Passdesk holds the credentials and makes the call itself. The agent only holds its own Passdesk token, which works only for the tools you approved.',
  },
  {
    q: "What happens when an agent asks for something it isn't allowed to do?",
    a: 'Passdesk declines it with a reason, such as “main is a protected branch”, and a hint where there is one. The decision goes on the record either way.',
  },
  {
    q: 'Can an agent go around Passdesk?',
    a: "An agent's only way out to the network is through Passdesk, and Passdesk itself can only reach an approved list of hosts.",
  },
  {
    q: 'What if a secret ends up in a push or a prompt?',
    a: 'Passdesk scans outgoing pushes and prompts for secrets and blocks them if it finds one.',
  },
  {
    q: 'Which agents does it work with?',
    a: 'A generic adapter for any MCP agent, including Claude Code, Codex and Cursor, is coming soon. Request early access and tell us what you run.',
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
          <h2 id="faq-title">Questions</h2>
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
