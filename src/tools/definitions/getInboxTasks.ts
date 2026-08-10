import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatJsonResponse, formatJsonError } from "../../utils/responseFormatter.js";
import { z } from 'zod';
import { getInboxTasks } from '../primitives/getInboxTasks.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

export const schema = z.object({
  hideCompleted: z.boolean().optional().describe("Set to false to show completed tasks in inbox (default: true)")
});

export interface GetInboxTasksArgs extends z.infer<typeof schema> {}

export async function handler(args: GetInboxTasksArgs, extra: RequestHandlerExtra): Promise<CallToolResult> {
  try {
    const result = await getInboxTasks({
      hideCompleted: args.hideCompleted !== false // Default to true
    });
    
    return {
      content: [{
        type: "text" as const,
        text: formatJsonResponse(result)
      }]
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      content: [{
        type: "text" as const,
        text: `Error getting inbox tasks: ${errorMessage}`
      }],
      isError: true
    };
  }
}