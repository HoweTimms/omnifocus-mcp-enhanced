import assert from 'node:assert/strict';
import test from 'node:test';
import { INTERNAL_IDEMPOTENCY_LOOKUP_TOOL, schema } from './findTaskByIdempotencyMarker.js';

test('internal marker lookup has an explicitly private tool name', () => {
  assert.equal(INTERNAL_IDEMPOTENCY_LOOKUP_TOOL, '_internal_find_task_by_idempotency_marker');
});

test('internal marker lookup schema accepts only deterministic markers', () => {
  assert.equal(schema.safeParse({ marker: `omnifocus-mcp:${'a'.repeat(64)}` }).success, true);
  assert.equal(schema.safeParse({ marker: 'bad' }).success, false);
  assert.equal(schema.safeParse({ marker: `omnifocus-mcp:${'A'.repeat(64)}` }).success, false);
});
