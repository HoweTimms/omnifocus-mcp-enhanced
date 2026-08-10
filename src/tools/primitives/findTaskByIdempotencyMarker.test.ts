import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  classifyMarkerLookupResult,
  findTaskByIdempotencyMarker,
} from './findTaskByIdempotencyMarker.js';

const marker = `omnifocus-mcp:${'a'.repeat(64)}`;

test('marker script performs an exact reserved-line scan across flattened tasks', async () => {
  const scriptUrl = new URL('../../utils/omnifocusScripts/findTaskByIdempotencyMarker.js', import.meta.url);
  const script = await readFile(scriptUrl, 'utf8');
  assert.match(script, /flattenedTasks\.filter/);
  assert.match(script, /line\.trim\(\) === expectedLine/);
  assert.match(script, /matches\.length === 0/);
  assert.match(script, /matches\.length > 1/);
  assert.doesNotMatch(script, /make new|delete|remove|set note|mark complete/i);
});

test('complete zero-match scan is authoritative not_found', () => {
  assert.deepEqual(classifyMarkerLookupResult({ status: 'not_found', completeScan: true }), { status: 'not_found' });
});

test('incomplete zero-match scan fails closed as unknown', () => {
  assert.deepEqual(
    classifyMarkerLookupResult({ status: 'not_found', completeScan: false }),
    { status: 'unknown', reason: 'marker scan was incomplete' },
  );
});

test('one valid exact match returns stable task identity', () => {
  assert.deepEqual(
    classifyMarkerLookupResult({ status: 'found', task: { id: 'task-id', name: 'Task' }, completeScan: true }),
    { status: 'found', task: { id: 'task-id', name: 'Task' } },
  );
});

test('multiple matches remain unknown and cannot authorize a retry', () => {
  assert.deepEqual(
    classifyMarkerLookupResult({ status: 'unknown', reason: 'multiple exact marker matches', matchCount: 2, completeScan: true }),
    { status: 'unknown', reason: 'multiple exact marker matches' },
  );
});

test('invalid marker is rejected without invoking automation executor', async () => {
  let invoked = false;
  const result = await findTaskByIdempotencyMarker('bad-marker', async () => {
    invoked = true;
    return {};
  });
  assert.equal(invoked, false);
  assert.equal(result.status, 'unknown');
});

test('executor errors become unknown rather than not_found', async () => {
  const result = await findTaskByIdempotencyMarker(marker, async () => {
    throw new Error('fixture automation unavailable');
  });
  assert.deepEqual(result, { status: 'unknown', reason: 'marker scan failed: fixture automation unavailable' });
});

test('valid marker is passed to injected fake executor without OmniFocus access', async () => {
  let received: unknown;
  const result = await findTaskByIdempotencyMarker(marker, async (script, args) => {
    received = { script, args };
    return { status: 'found', task: { id: 'fake-id', name: 'Fake' }, completeScan: true };
  });
  assert.deepEqual(received, { script: '@findTaskByIdempotencyMarker.js', args: { marker } });
  assert.deepEqual(result, { status: 'found', task: { id: 'fake-id', name: 'Fake' } });
});
