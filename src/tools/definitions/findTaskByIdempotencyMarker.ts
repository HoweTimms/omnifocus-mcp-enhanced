import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { findTaskByIdempotencyMarker } from '../primitives/findTaskByIdempotencyMarker.js';

export const INTERNAL_IDEMPOTENCY_LOOKUP_TOOL = '_internal_find_task_by_idempotency_marker';

export const schema = z.object({
  marker: z.string().regex(/^omnifocus-mcp:[a-f0-9]{64}$/),
});

export async function handler(
  args: z.infer<typeof schema>,
  _extra: RequestHandlerExtra,
): Promise<CallToolResult> {
  const result = await findTaskByIdempotencyMarker(args.marker);
  return {
    content: [{ type: 'text', text: JSON.stringify(result) }],
    ...(result.status === 'unknown' ? { isError: true } : {}),
  };
}
