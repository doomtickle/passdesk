import { WaitlistForm } from './WaitlistForm';
import './Closing.css';

export function Closing() {
  return (
    <section id="get-access" className="section section--dark closing on-dark" aria-labelledby="closing-title">
      <div className="container closing__inner">
        <h2 id="closing-title">
          Passdesk holds the keys and <span className="closing__accent">keeps the record.</span>
        </h2>
        <p className="closing__text">
          Your agents keep doing the work. Passdesk holds the keys and keeps the record.
        </p>
        <WaitlistForm source="closing" />
      </div>
    </section>
  );
}
