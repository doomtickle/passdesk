import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasOwnerMarker, renderLaunchPost, stripHtmlComments } from './launchPost.js';

test('renderLaunchPost converts headings and paragraphs', () => {
  const html = renderLaunchPost('# Title\n\nBody text.\n\n## Section\n\nMore text.');
  assert.match(html, /<h1>Title<\/h1>/);
  assert.match(html, /<p>Body text.<\/p>/);
  assert.match(html, /<h2>Section<\/h2>/);
  assert.match(html, /<p>More text.<\/p>/);
});

test('renderLaunchPost marks external links and leaves internal links alone', () => {
  const html = renderLaunchPost('See [flatt.tech](https://flatt.tech/research) and [home](/).');

  assert.match(html, /<a href="https:\/\/flatt\.tech\/research"[^>]*class="external-link"[^>]*>flatt\.tech<\/a>/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /flatt\.tech<\/a><span class="visually-hidden"> \(opens in new tab\)<\/span>/);

  assert.match(html, /<a href="\/">home<\/a>/);
});

test('stripHtmlComments removes HTML comments from markdown', () => {
  const input = 'Before.\n\n<!-- a note to self -->\n\nAfter.';
  assert.equal(stripHtmlComments(input), 'Before.\n\n\n\nAfter.');
});

test('renderLaunchPost strips HTML comments from the rendered output', () => {
  const html = renderLaunchPost('Visible text.\n<!-- hidden note -->\nMore visible text.');
  assert.doesNotMatch(html, /hidden note/);
  assert.match(html, /Visible text\./);
  assert.match(html, /More visible text\./);
});

test('hasOwnerMarker detects an OWNER: marker', () => {
  assert.equal(hasOwnerMarker('plain text, nothing to see'), false);
  assert.equal(hasOwnerMarker('<!-- OWNER: verify this claim -->'), true);
  assert.equal(hasOwnerMarker('inline OWNER: note without comment markers'), true);
});
