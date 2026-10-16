import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import {
  deskFrame,
  nextPosition,
  phaseDuration,
  startPosition,
  stillFrame,
  type TimelinePosition,
} from '../lib/deskTimeline';
import { DESK_SCRIPT, RACK_KEYS, describeTicket } from './deskScript';
import './DeskDemo.css';

const LENGTH = DESK_SCRIPT.length;
const START = startPosition(LENGTH);
const STILL = stillFrame(LENGTH);
const MOVE_MS = 450;
const MOVE_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Slides list items from their previous position to their new one when items
 * are added above them (FLIP), so the move is a transform and not a layout jump.
 */
function useFlip(listRef: RefObject<HTMLOListElement>, enabled: boolean) {
  const tops = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const next = new Map<string, number>();
    for (const child of Array.from(list.children) as HTMLElement[]) {
      const id = child.dataset.flipId;
      if (!id) continue;
      const top = child.offsetTop;
      next.set(id, top);
      const previous = tops.current.get(id);
      if (enabled && previous !== undefined && previous !== top && typeof child.animate === 'function') {
        child.animate([{ transform: `translateY(${previous - top}px)` }, { transform: 'translateY(0)' }], {
          duration: MOVE_MS,
          easing: MOVE_EASING,
        });
      }
    }
    tops.current = next;
  });
}

function isFocusVisible(element: Element): boolean {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

// The hero "desk": agents bring requests, the desk decides with keys that never
// leave the rack, and every decision goes on the record. Timing and frame logic
// live in src/lib/deskTimeline.ts; copy lives in ./deskScript.ts.
export function DeskDemo() {
  const reduced = useReducedMotion();
  const [pos, setPos] = useState<TimelinePosition>(START);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Pressing play while hovering or focused overrides those pauses until the
  // pointer or focus leaves the panel.
  const [override, setOverride] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);

  const figureRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const slipsRef = useRef<HTMLOListElement>(null);
  const recordRef = useRef<HTMLOListElement>(null);
  const remainingRef = useRef<number | null>(null);

  const shownPaused = userPaused || ((hovered || focused) && !override);
  const running = !reduced && !shownPaused && inView && pageVisible;

  // Timeline driver: one timeout per phase. Pausing keeps the time left in the
  // current phase so resuming doesn't skip or repeat anything.
  useEffect(() => {
    if (!running) return;
    const duration = remainingRef.current ?? phaseDuration(pos, LENGTH);
    remainingRef.current = null;
    const startedAt = performance.now();
    let fired = false;
    const timer = window.setTimeout(() => {
      fired = true;
      setPos(nextPosition);
    }, duration);
    return () => {
      window.clearTimeout(timer);
      if (!fired) remainingRef.current = Math.max(0, duration - (performance.now() - startedAt));
    };
  }, [running, pos]);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useFlip(slipsRef, !reduced);
  useFlip(recordRef, !reduced);

  // Until the first tick (and always with reduced motion) show the composed still frame.
  const frame = reduced || pos === START ? STILL : deskFrame(pos, LENGTH);
  const activeKey = frame.activeIndex === null ? null : DESK_SCRIPT[frame.activeIndex].key;

  const togglePaused = () => {
    if (shownPaused) {
      setUserPaused(false);
      setOverride(true);
    } else {
      setUserPaused(true);
    }
  };

  const panelClass = ['desk__panel', running ? '' : 'is-paused', reduced ? 'is-still' : ''].filter(Boolean).join(' ');

  return (
    <figure className="desk" ref={figureRef}>
      <div
        ref={panelRef}
        className={panelClass}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          if (!focused) setOverride(false);
        }}
        onFocus={(event) => setFocused(isFocusVisible(event.target))}
        onBlur={(event) => {
          if (!panelRef.current?.contains(event.relatedTarget as Node | null)) {
            setFocused(false);
            if (!hovered) setOverride(false);
          }
        }}
      >
        <div className="desk__agents" aria-hidden="true">
          <div className="desk__zone-head">
            <p className="desk__zone-label">Agents</p>
            <span className="desk__chip">No keys</span>
          </div>
          <ol className="desk__tickets" ref={slipsRef}>
            {frame.slips.map((slip) => {
              const ticket = DESK_SCRIPT[slip.index];
              const className = [
                'ticket',
                slip.entering && 'is-entering',
                slip.stamping && 'is-stamping',
                slip.stamped && 'is-stamped',
                slip.leaving && 'is-leaving',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <li key={slip.id} data-flip-id={slip.id} className={className}>
                  <div className="ticket__body">
                    <p className="ticket__agent">{ticket.agent}</p>
                    <p className="ticket__request">{ticket.request}</p>
                    {ticket.reason && <p className="ticket__reason">{ticket.reason}</p>}
                  </div>
                  <span className={`stamp stamp--${ticket.decision.toLowerCase()}`}>{ticket.decision}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="desk__rack" aria-hidden="true">
          <p className="desk__zone-label">Keys stay at the desk</p>
          <ul className="rack">
            {RACK_KEYS.map((key) => (
              <li key={key} className={key === activeKey ? 'key-tag is-active' : 'key-tag'}>
                {key}
              </li>
            ))}
          </ul>
        </div>

        <div className="desk__record">
          <div className="desk__record-head">
            <p className="desk__zone-label" aria-hidden="true">
              On the record
            </p>
            {!reduced && (
              <button
                type="button"
                className="desk__toggle"
                aria-label={shownPaused ? 'Play animation' : 'Pause animation'}
                aria-pressed={shownPaused}
                onClick={togglePaused}
              >
                <span className={shownPaused ? 'desk__icon desk__icon--play' : 'desk__icon desk__icon--pause'} />
              </button>
            )}
          </div>
          <ol className="record" ref={recordRef} aria-hidden="true">
            {frame.records.map((line) => {
              const ticket = DESK_SCRIPT[line.index];
              const className = ['record__line', line.entering && 'is-entering', line.leaving && 'is-leaving']
                .filter(Boolean)
                .join(' ');
              return (
                <li key={line.id} data-flip-id={line.id} className={className}>
                  <span className="record__time">{ticket.time}</span>
                  <span className="record__agent">{ticket.agent}</span>
                  <span className="record__action">{ticket.tool}</span>
                  <span className={`record__decision record__decision--${ticket.decision.toLowerCase()}`}>
                    {ticket.decision}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <ol className="visually-hidden">
          {DESK_SCRIPT.map((ticket, i) => (
            <li key={i}>{describeTicket(ticket)}</li>
          ))}
        </ol>
      </div>
      <figcaption className="desk__caption">Illustration: requests going through Passdesk</figcaption>
    </figure>
  );
}
