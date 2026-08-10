import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { getTaskSnapshot, INTERNAL_TASK_SNAPSHOT_TOOL } from '../primitives/getTaskSnapshot.js';
export { INTERNAL_TASK_SNAPSHOT_TOOL };
export const schema = z.object({ taskId: z.string().min(1) });
export async function handler(args: z.infer<typeof schema>, _extra: RequestHandlerExtra): Promise<CallToolResult> {
  const result = await getTaskSnapshot(args.taskId);
  return { content: [{ type: 'text', text: JSON.stringify(result) }], ...(result.status === 'unknown' ? { isError: true } : {}) };
}
