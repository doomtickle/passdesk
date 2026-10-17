import { WaitlistForm } from './WaitlistForm';
import './Closing.css';

export function Closing() {
  return (
    <section id="get-access" className="section section--dark closing on-dark" aria-labelledby="closing-title">
      <div className="container closing__inner">
        <h2 id="closing-title">
          The keys stay on your machine. <span className="closing__accent">The record stays with you.</span>
        </h2>
        <p className="closing__text">
          Your agents keep doing the work. Passdesk keeps them out of your keys and keeps the record.
        </p>
        <WaitlistForm source="closing" />
      </div>
    </section>
  );
}
