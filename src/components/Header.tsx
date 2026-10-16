import { useEffect, useRef, useState } from 'react';
import { KeyMark } from './KeyMark';
import './Header.css';

const NAV = [
  { href: '#how', label: 'How it works' },
  { href: '#under-the-hood', label: 'For security' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  // The header is transparent while the top of the page is in view and turns
  // solid once the sentinel (just below the header) scrolls out of view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // While the mobile menu is open, Escape closes it and returns focus to the
  // menu button; a click or tap outside the header closes it too.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div ref={sentinel} className="header-sentinel" aria-hidden="true" />
      <header
        ref={header}
        className={`site-header on-dark${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}
      >
        <div className="container site-header__inner">
          <a className="wordmark" href="#top">
            <KeyMark className="wordmark__mark" />
            <span>Passdesk</span>
          </a>
          <button
            ref={menuButton}
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="menu-button__icon" aria-hidden="true" />
            Menu
          </button>
          <div id="site-menu" className="site-menu">
            <nav aria-label="Primary">
              <ul className="site-nav">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} onClick={closeMenu}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <a className="button button--brass site-header__cta" href="#get-access" onClick={closeMenu}>
              Request early access
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
