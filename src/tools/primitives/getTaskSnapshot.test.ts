import assert from 'node:assert/strict';
import test from 'node:test';
import { getTaskSnapshot } from './getTaskSnapshot.js';

const nativeTask = { id: 'task-1', name: 'Native task', note: 'Keep OmniFocus native', hasChildren: false, childrenCount: 0, tags: ['Work'], flagged: true, completed: false, attachments: [], linkedFileURLs: [] };

test('returns an exact normalized machine-readable snapshot', async () => {
    const result = await getTaskSnapshot('task-1', async () => ({ success: true, task: nativeTask }));
    assert.deepEqual(result, { status: 'found', task: {
      id: 'task-1', name: 'Native task', note: 'Keep OmniFocus native', dueDate: null,
      deferDate: null, plannedDate: null, flagged: true, estimatedMinutes: null,
      completed: false, projectId: null, parentId: null, tags: ['Work'],
    } });
});

test('fails closed on lookup error or mismatched identity', async () => {
    assert.deepEqual(await getTaskSnapshot('task-1', async () => ({ success: false, error: 'automation failed' })), { status: 'unknown', reason: 'automation failed' });
    assert.deepEqual(await getTaskSnapshot('task-1', async () => ({ success: true, task: { ...nativeTask, id: 'task-2' } })), { status: 'unknown', reason: 'exact task snapshot returned a different task ID' });
});
