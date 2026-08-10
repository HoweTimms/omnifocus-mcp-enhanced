import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { getTodayCompletedTasks } from '../primitives/getTodayCompletedTasks.js';

export const schema = z.object({
  limit: z.number().min(1).max(100).default(20).optional().describe('返回的最大任务数量 (默认: 20)')
});

export interface GetTodayCompletedTasksArgs extends z.infer<typeof schema> {}

export async function handler(args: GetTodayCompletedTasksArgs, extra: RequestHandlerExtra): Promise<CallToolResult> {
  const { limit } = args;
  
  const result = await getTodayCompletedTasks({ 
    limit 
  });
  
  return {
    content: [{ type: "text" as const, text: result }]
  };
}