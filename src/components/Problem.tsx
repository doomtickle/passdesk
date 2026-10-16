import { KeyMark } from './KeyMark';
import './Problem.css';

const ROWS = [
  {
    label: 'Who holds the credentials',
    without: 'The agent',
    with: 'Passdesk, fetched fresh for each call',
  },
  {
    label: 'Where the agent can connect',
    without: 'Anywhere on the internet',
    with: 'Only to Passdesk',
  },
  {
    label: "What it's allowed to do",
    without: 'Whatever the token allows',
    with: 'Only the tools you approved, within your rules',
  },
  {
    label: 'What you can see afterwards',
    without: 'Nothing',
    with: 'Every call, with its decision',
  },
];

// Explicit ARIA roles keep table semantics when the rows are restyled as
// stacked blocks on small screens.
export function Problem() {
  return (
    <section id="problem" className="section section--paper" aria-labelledby="problem-title">
      <div className="container">
        <div className="section-head">
          <h2 id="problem-title">Today, an agent that can push code holds the key to your repo.</h2>
          <p>
            To let an agent do real work, teams hand it a token. That token sits in the agent's
            environment, works from anywhere on the internet, and leaves no record of what it was used for.
            If the agent is tricked by something it reads, the token goes wherever it's told.
          </p>
        </div>

        <table className="compare" role="table">
          <caption className="visually-hidden">Without Passdesk compared with Passdesk</caption>
          <thead role="rowgroup">
            <tr role="row">
              <td role="cell" className="compare__corner" />
              <th role="columnheader" scope="col" className="compare__without">
                Without Passdesk
              </th>
              <th role="columnheader" scope="col" className="compare__with">
                <span className="compare__with-head">
                  <KeyMark size={24} className="compare__key" />
                  With Passdesk
                </span>
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {ROWS.map((row) => (
              <tr role="row" key={row.label}>
                <th role="rowheader" scope="row">
                  {row.label}
                </th>
                <td role="cell" className="compare__without" data-label="Without Passdesk">
                  {row.without}
                </td>
                <td role="cell" className="compare__with" data-label="With Passdesk">
                  {row.with}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
