import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { getFlaggedTasks } from '../primitives/getFlaggedTasks.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

export const schema = z.object({
  hideCompleted: z.boolean().optional().describe("Set to false to show completed flagged tasks (default: true)"),
  projectFilter: z.string().optional().describe("Filter flagged tasks by project name (optional)")
});

export interface GetFlaggedTasksArgs extends z.infer<typeof schema> {}

export async function handler(args: GetFlaggedTasksArgs, extra: RequestHandlerExtra): Promise<CallToolResult> {
  try {
    const result = await getFlaggedTasks({
      hideCompleted: args.hideCompleted !== false, // Default to true
      projectFilter: args.projectFilter
    });
    
    return {
      content: [{
        type: "text" as const,
        text: result
      }]
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      content: [{
        type: "text" as const,
        text: `Error getting flagged tasks: ${errorMessage}`
      }],
      isError: true
    };
  }
}