import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deskFrame,
  nextPosition,
  phaseDuration,
  startPosition,
  stillFrame,
  TIMING,
  type TimelinePosition,
} from './deskTimeline.js';

const LENGTH = 6;

const ids = (items: { id: number }[]) => items.map((item) => item.id);
const indexes = (items: { index: number }[]) => items.map((item) => item.index);

test('the still frame shows requests 4 to 6 stamped, four records and no key', () => {
  assert.deepEqual(startPosition(LENGTH), { step: 5, phase: 'record' });

  const frame = stillFrame(LENGTH);
  assert.deepEqual(indexes(frame.slips), [5, 4, 3]);
  assert.equal(
    frame.slips.every((slip) => slip.stamped && !slip.leaving && !slip.stamping && !slip.entering),
    true,
  );
  assert.deepEqual(indexes(frame.records), [5, 4, 3, 2]);
  assert.equal(
    frame.records.every((line) => !line.entering && !line.leaving),
    true,
  );
  assert.equal(frame.activeIndex, null);
});

test('the start position itself has the newest record mid-entry and a fifth line leaving', () => {
  const frame = deskFrame(startPosition(LENGTH), LENGTH);
  assert.deepEqual(indexes(frame.records), [5, 4, 3, 2, 1]);
  assert.equal(frame.records[0].entering, true);
  assert.equal(frame.records[4].leaving, true);
});

test('phases advance in order and roll over to the next step', () => {
  let pos: TimelinePosition = { step: 0, phase: 'enter' };
  const seen: string[] = [];
  for (let i = 0; i < 6; i++) {
    seen.push(`${pos.step}:${pos.phase}`);
    pos = nextPosition(pos);
  }
  assert.deepEqual(seen, ['0:enter', '0:lookup', '0:stamp', '0:record', '1:enter', '1:lookup']);
});

test('a new slip enters unstamped, glows its key, then gets stamped and recorded', () => {
  const step = 7; // script index 1, second time round
  const enter = deskFrame({ step, phase: 'enter' }, LENGTH);
  assert.deepEqual(enter.slips[0], { id: 7, index: 1, entering: true, stamping: false, stamped: false, leaving: false });
  assert.equal(enter.activeIndex, null);
  assert.equal(enter.records[0].id, 6);

  const lookup = deskFrame({ step, phase: 'lookup' }, LENGTH);
  assert.equal(lookup.slips[0].entering, false);
  assert.equal(lookup.slips[0].stamped, false);
  assert.equal(lookup.activeIndex, 1);

  const stamp = deskFrame({ step, phase: 'stamp' }, LENGTH);
  assert.equal(stamp.slips[0].stamping, true);
  assert.equal(stamp.slips[0].stamped, true);
  assert.equal(stamp.activeIndex, null);
  assert.equal(stamp.records[0].id, 6);

  const record = deskFrame({ step, phase: 'record' }, LENGTH);
  assert.equal(record.slips[0].stamping, false);
  assert.equal(record.slips[0].stamped, true);
  assert.deepEqual(record.records[0], { id: 7, index: 1, entering: true, leaving: false });
  assert.equal(record.records.slice(1).some((line) => line.entering), false);
});

test('older slips stay stamped and the fourth fades out only while the new one enters', () => {
  const enter = deskFrame({ step: 9, phase: 'enter' }, LENGTH);
  assert.deepEqual(ids(enter.slips), [9, 8, 7, 6]);
  assert.deepEqual(
    enter.slips.map((slip) => slip.leaving),
    [false, false, false, true],
  );
  assert.equal(enter.slips.slice(1).every((slip) => slip.stamped), true);

  const lookup = deskFrame({ step: 9, phase: 'lookup' }, LENGTH);
  assert.deepEqual(ids(lookup.slips), [9, 8, 7]);
});

test('the record keeps the last four lines and fades the fifth as a new line lands', () => {
  const record = deskFrame({ step: 9, phase: 'record' }, LENGTH);
  assert.deepEqual(ids(record.records), [9, 8, 7, 6, 5]);
  assert.deepEqual(
    record.records.map((line) => line.leaving),
    [false, false, false, false, true],
  );

  const next = deskFrame({ step: 10, phase: 'enter' }, LENGTH);
  assert.deepEqual(ids(next.records), [9, 8, 7, 6]);
});

test('early steps show fewer slips and records without negative ids', () => {
  const first = deskFrame({ step: 0, phase: 'enter' }, LENGTH);
  assert.deepEqual(ids(first.slips), [0]);
  assert.deepEqual(first.records, []);

  const third = deskFrame({ step: 2, phase: 'record' }, LENGTH);
  assert.deepEqual(ids(third.slips), [2, 1, 0]);
  assert.deepEqual(ids(third.records), [2, 1, 0]);

  const fourth = deskFrame({ step: 3, phase: 'enter' }, LENGTH);
  assert.deepEqual(ids(fourth.slips), [3, 2, 1, 0]);
  assert.equal(fourth.slips[3].leaving, true);
});

test('the loop continues past the end of the script with stable ids', () => {
  const frame = deskFrame({ step: 13, phase: 'record' }, LENGTH);
  assert.deepEqual(ids(frame.slips), [13, 12, 11]);
  assert.deepEqual(indexes(frame.slips), [1, 0, 5]);
  assert.deepEqual(indexes(frame.records), [1, 0, 5, 4, 3]);
});

test('limits are configurable', () => {
  const frame = deskFrame({ step: 5, phase: 'record' }, LENGTH, { maxSlips: 2, maxRecords: 1 });
  assert.deepEqual(ids(frame.slips), [5, 4]);
  assert.deepEqual(ids(frame.records), [5, 4]);
  assert.equal(frame.records[1].leaving, true);
});

test('each step lasts about 2.8s and the last one holds 1.5s longer', () => {
  const stepLength = (step: number) =>
    (['enter', 'lookup', 'stamp', 'record'] as const).reduce(
      (total, phase) => total + phaseDuration({ step, phase }, LENGTH),
      0,
    );
  assert.equal(stepLength(0), 2800);
  assert.equal(stepLength(4), 2800);
  assert.equal(stepLength(5), 2800 + TIMING.hold);
  assert.equal(stepLength(11), 2800 + TIMING.hold);
  assert.equal(phaseDuration({ step: 5, phase: 'enter' }, LENGTH), TIMING.enter);
});
