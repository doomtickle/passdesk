import { CONTACT_EMAIL } from '../config';
import { KeyMark } from './KeyMark';
import './Footer.css';

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#under-the-hood', label: 'For security' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: 'https://github.com/doomtickle/passdesk-broker', label: 'Source' },
  { href: '#get-access', label: 'Request early access' },
];

export function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="container site-footer__inner">
        <p className="site-footer__brand">
          <KeyMark size={24} className="site-footer__mark" />
          <span>© 2026 Passdesk</span>
        </p>
        <nav aria-label="Footer">
          <ul className="site-footer__links">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="site-footer__contact">
          Contact: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </footer>
  );
}
