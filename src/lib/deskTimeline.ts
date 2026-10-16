// Pure timeline logic for the hero "desk" animation (src/components/DeskDemo.tsx).
//
// The animation is a sequence of steps, one per request slip. `step` counts up
// forever (0, 1, 2, ...) and maps onto the script with `step % length`, so the
// loop keeps rolling without a reset and every slip/record keeps a stable id.
// Each step moves through four phases:
//   enter  - the new slip slides in, older slips move down, the oldest fades out
//   lookup - the matching key tag glows on the rack (it never moves)
//   stamp  - the decision stamp lands on the slip
//   record - the decision is written into the record, then the desk rests

export type Phase = 'enter' | 'lookup' | 'stamp' | 'record';

export const PHASES: readonly Phase[] = ['enter', 'lookup', 'stamp', 'record'];

export interface TimelinePosition {
  step: number;
  phase: Phase;
}

/** Phase lengths in ms. One step is ~2.8s; after the last request the desk holds a while longer. */
export const TIMING: Readonly<Record<Phase, number> & { hold: number }> = {
  enter: 450,
  lookup: 600,
  stamp: 500,
  record: 1250,
  hold: 1500,
};

export interface SlipView {
  /** Global step number; stable across loops, use as the React key. */
  id: number;
  /** Index into the script. */
  index: number;
  /** The slip is sliding in right now. */
  entering: boolean;
  /** The stamp is landing right now. */
  stamping: boolean;
  /** The slip carries its stamp (and, if declined, its reason). */
  stamped: boolean;
  /** The slip was pushed past the limit and is fading out. */
  leaving: boolean;
}

export interface RecordView {
  id: number;
  index: number;
  /** The line was just written. */
  entering: boolean;
  /** The line was pushed past the limit and is fading out. */
  leaving: boolean;
}

export interface DeskFrame {
  /** Newest first. At most `maxSlips` plus one leaving slip during `enter`. */
  slips: SlipView[];
  /** Newest first. At most `maxRecords` plus one leaving line during `record`. */
  records: RecordView[];
  /** Script index whose key tag is glowing, or null. */
  activeIndex: number | null;
}

export interface FrameLimits {
  maxSlips: number;
  maxRecords: number;
}

const DEFAULT_LIMITS: FrameLimits = { maxSlips: 3, maxRecords: 4 };

function rank(phase: Phase): number {
  return PHASES.indexOf(phase);
}

/**
 * Where the animation starts (see stillFrame for the settled version): the last
 * request has just been recorded, so the final slips and records are on screen.
 */
export function startPosition(length: number): TimelinePosition {
  return { step: length - 1, phase: 'record' };
}

export function nextPosition(pos: TimelinePosition): TimelinePosition {
  const i = rank(pos.phase);
  if (i < PHASES.length - 1) return { step: pos.step, phase: PHASES[i + 1] };
  return { step: pos.step + 1, phase: PHASES[0] };
}

/** How long to stay at `pos` before moving on. */
export function phaseDuration(pos: TimelinePosition, length: number): number {
  const isLast = pos.step % length === length - 1;
  return TIMING[pos.phase] + (pos.phase === 'record' && isLast ? TIMING.hold : 0);
}

/** Which slips, records and key highlight are on screen at `pos`. */
export function deskFrame(pos: TimelinePosition, length: number, limits: FrameLimits = DEFAULT_LIMITS): DeskFrame {
  const { step, phase } = pos;
  const r = rank(phase);
  const indexOf = (id: number) => id % length;

  const slips: SlipView[] = [];
  const oldestSlip = Math.max(0, step - limits.maxSlips + 1);
  for (let id = step; id >= oldestSlip; id--) {
    const current = id === step;
    slips.push({
      id,
      index: indexOf(id),
      entering: current && phase === 'enter',
      stamping: current && phase === 'stamp',
      stamped: !current || r >= rank('stamp'),
      leaving: false,
    });
  }
  const leavingSlip = step - limits.maxSlips;
  if (phase === 'enter' && leavingSlip >= 0) {
    slips.push({ id: leavingSlip, index: indexOf(leavingSlip), entering: false, stamping: false, stamped: true, leaving: true });
  }

  const records: RecordView[] = [];
  const newestRecord = r >= rank('record') ? step : step - 1;
  const oldestRecord = Math.max(0, newestRecord - limits.maxRecords + 1);
  for (let id = newestRecord; id >= oldestRecord; id--) {
    records.push({ id, index: indexOf(id), entering: phase === 'record' && id === step, leaving: false });
  }
  const leavingRecord = newestRecord - limits.maxRecords;
  if (phase === 'record' && leavingRecord >= 0) {
    records.push({ id: leavingRecord, index: indexOf(leavingRecord), entering: false, leaving: true });
  }

  return { slips, records, activeIndex: phase === 'lookup' ? indexOf(step) : null };
}

/**
 * The composed frame at the start position with nothing mid-motion: shown on
 * first paint and, with reduced motion, as the only frame.
 */
export function stillFrame(length: number, limits: FrameLimits = DEFAULT_LIMITS): DeskFrame {
  const frame = deskFrame(startPosition(length), length, limits);
  return {
    slips: frame.slips.filter((slip) => !slip.leaving).map((slip) => ({ ...slip, entering: false, stamping: false })),
    records: frame.records.filter((line) => !line.leaving).map((line) => ({ ...line, entering: false })),
    activeIndex: null,
  };
}
