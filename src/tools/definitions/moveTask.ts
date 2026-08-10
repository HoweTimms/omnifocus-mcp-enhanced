import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatJsonResponse, formatJsonError } from "../../utils/responseFormatter.js";
import { z } from 'zod';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { moveTask, MoveTaskParams } from '../primitives/moveTask.js';

export const schema = z.object({
  id: z.string().optional().describe('The ID of the task to move'),
  name: z.string().optional().describe('The name of the task to move (fallback if ID not provided)'),
  targetProjectId: z.string().optional().describe('Destination project ID'),
  targetProjectName: z.string().optional().describe('Destination project name (errors on duplicate names)'),
  targetParentTaskId: z.string().optional().describe('Destination parent task ID'),
  targetParentTaskName: z.string().optional().describe('Destination parent task name (errors on duplicate names)'),
  targetInbox: z.boolean().optional().describe('Move task to inbox')
});

function formatDestination(args: z.infer<typeof schema>): string {
  if (args.targetInbox) {
    return 'inbox';
  }

  if (args.targetProjectId || args.targetProjectName) {
    return `project "${args.targetProjectId || args.targetProjectName}"`;
  }

  if (args.targetParentTaskId || args.targetParentTaskName) {
    return `parent task "${args.targetParentTaskId || args.targetParentTaskName}"`;
  }

  return 'destination';
}

export interface MoveTaskArgs extends z.infer<typeof schema> {}

export async function handler(args: MoveTaskArgs, extra: RequestHandlerExtra): Promise<CallToolResult> {
  try {
    const result = await moveTask(args as MoveTaskParams);

    if (result.success) {
      return {
        content: [{
          type: 'text' as const,
          text: formatJsonResponse({ id: result.id || args.id, name: result.name || args.name, itemType: "task", message: "Moved successfully" })
        }]
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: formatJsonError("backend_execution_error", `Failed to move task: ${result.error}`)
      }],
      isError: true
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Tool execution error: ${error.message}`);

    return {
      content: [{
        type: 'text' as const,
        text: formatJsonError("backend_execution_error", `Error moving task: ${error.message}`)
      }],
      isError: true
    };
  }
}
