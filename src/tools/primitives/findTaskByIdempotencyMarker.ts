import { executeOmniFocusScript } from '../../utils/scriptExecution.js';

export type MarkerLookupResult =
  | { status: 'found'; task: { id: string; name: string } }
  | { status: 'not_found' }
  | { status: 'unknown'; reason: string };

type RawMarkerLookupResult = {
  status?: unknown;
  task?: { id?: unknown; name?: unknown };
  reason?: unknown;
  completeScan?: unknown;
  matchCount?: unknown;
};

export const IDEMPOTENCY_MARKER_PATTERN = /^omnifocus-mcp:[a-f0-9]{64}$/;

export function classifyMarkerLookupResult(raw: RawMarkerLookupResult): MarkerLookupResult {
  if (raw.status === 'found') {
    if (raw.completeScan !== true || typeof raw.task?.id !== 'string' || typeof raw.task?.name !== 'string') {
      return { status: 'unknown', reason: 'invalid found response from marker scan' };
    }
    return { status: 'found', task: { id: raw.task.id, name: raw.task.name } };
  }
  if (raw.status === 'not_found') {
    return raw.completeScan === true
      ? { status: 'not_found' }
      : { status: 'unknown', reason: 'marker scan was incomplete' };
  }
  if (raw.status === 'unknown') {
    const reason = typeof raw.reason === 'string' ? raw.reason : 'marker scan returned unknown';
    return { status: 'unknown', reason };
  }
  return { status: 'unknown', reason: 'invalid marker scan response' };
}

export async function findTaskByIdempotencyMarker(
  marker: string,
  executor: typeof executeOmniFocusScript = executeOmniFocusScript,
): Promise<MarkerLookupResult> {
  if (!IDEMPOTENCY_MARKER_PATTERN.test(marker)) {
    return { status: 'unknown', reason: 'invalid idempotency marker' };
  }
  try {
    const raw = await executor('@findTaskByIdempotencyMarker.js', { marker }) as RawMarkerLookupResult;
    return classifyMarkerLookupResult(raw);
  } catch (error) {
    return { status: 'unknown', reason: `marker scan failed: ${(error as Error).message}` };
  }
}
