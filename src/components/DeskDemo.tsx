import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import {
  deskFrame,
  nextPosition,
  phaseDuration,
  recordTime,
  startPosition,
  stillFrame,
  type FrameLimits,
  type TimelinePosition,
} from '../lib/deskTimeline';
import { DESK_SCRIPT, RACK_KEYS, describeTicket } from './deskScript';
import './DeskDemo.css';

const LENGTH = DESK_SCRIPT.length;
const START = startPosition(LENGTH);
// Small screens show two slips so the stack stays short.
const LIMITS: FrameLimits = { maxSlips: 3, maxRecords: 4 };
const SMALL_LIMITS: FrameLimits = { maxSlips: 2, maxRecords: 4 };
const STILL = stillFrame(LENGTH, LIMITS);
const SMALL_STILL = stillFrame(LENGTH, SMALL_LIMITS);
const MOVE_MS = 450;
const MOVE_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

function matches(media: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.(media).matches === true;
}

function useMediaQuery(media: string): boolean {
  const [match, setMatch] = useState(() => matches(media));
  useEffect(() => {
    const query = window.matchMedia?.(media);
    if (!query) return;
    const update = () => setMatch(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [media]);
  return match;
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

// The hero "desk": agents bring requests, the desk decides with keys that never
// leave the rack, and every decision goes on the record. Timing and frame logic
// live in src/lib/deskTimeline.ts; copy lives in ./deskScript.ts.
export function DeskDemo() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const small = useMediaQuery('(max-width: 560px)');
  const [pos, setPos] = useState<TimelinePosition>(START);
  const [userPaused, setUserPaused] = useState(false);
  // Hovering pauses silently; the button only reflects the visitor's own choice.
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);

  const figureRef = useRef<HTMLElement>(null);
  const slipsRef = useRef<HTMLOListElement>(null);
  const recordRef = useRef<HTMLOListElement>(null);
  const remainingRef = useRef<number | null>(null);

  const running = !reduced && !userPaused && !hovered && inView && pageVisible;

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
  const frame =
    reduced || pos === START ? (small ? SMALL_STILL : STILL) : deskFrame(pos, LENGTH, small ? SMALL_LIMITS : LIMITS);
  const activeKey = frame.activeIndex === null ? null : DESK_SCRIPT[frame.activeIndex].key;

  const panelClass = ['desk__panel', running ? '' : 'is-paused', reduced ? 'is-still' : ''].filter(Boolean).join(' ');

  return (
    <figure className="desk" ref={figureRef}>
      <div
        className={panelClass}
        onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
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
                aria-label="Pause animation"
                aria-pressed={userPaused}
                onClick={() => setUserPaused((paused) => !paused)}
              >
                <span className={userPaused ? 'desk__icon desk__icon--play' : 'desk__icon desk__icon--pause'} />
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
                  <span className="record__time">{recordTime(ticket.time, line.id, LENGTH)}</span>
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
