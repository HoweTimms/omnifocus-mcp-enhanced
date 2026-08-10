import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatJsonResponse, formatJsonError } from "../../utils/responseFormatter.js";
import { z } from 'zod';
import { removeItem, RemoveItemParams } from '../primitives/removeItem.js';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

export const schema = z.object({
  id: z.string().optional().describe("The ID of the task or project to remove"),
  name: z.string().optional().describe("The name of the task or project to remove (as fallback if ID not provided)"),
  itemType: z.enum(['task', 'project']).describe("Type of item to remove ('task' or 'project')")
});

export interface RemoveItemArgs extends z.infer<typeof schema> {}

export async function handler(args: RemoveItemArgs, extra: RequestHandlerExtra): Promise<CallToolResult> {
  try {
    // Validate that either id or name is provided
    if (!args.id && !args.name) {
      return {
        content: [{
          type: "text" as const,
          text: formatJsonError("validation_error", "Either id or name must be provided.")
        }],
        isError: true
      };
    }
    
    // Validate itemType
    if (!['task', 'project'].includes(args.itemType)) {
      return {
        content: [{
          type: "text" as const,
          text: formatJsonError("validation_error", `Invalid item type`)
        }],
        isError: true
      };
    }
    
    // Log the remove operation for debugging
    console.error(`Removing ${args.itemType} with ID: ${args.id || 'not provided'}, Name: ${args.name || 'not provided'}`);
    
    // Call the removeItem function 
    const result = await removeItem(args as RemoveItemParams);
    
    if (result.success) {
      // Item was removed successfully
      const itemTypeLabel = args.itemType === 'task' ? 'Task' : 'Project';
      
      return {
        content: [{
          type: "text" as const,
          text: formatJsonResponse({ id: args.id || null, name: result.name || args.name, itemType: args.itemType, message: "Removed successfully" })
        }]
      };
    } else {
      // Item removal failed
      let errorMsg = `Failed to remove ${args.itemType}`;
      
      if (result.error) {
        if (result.error.includes("Item not found")) {
          errorMsg = `${args.itemType.charAt(0).toUpperCase() + args.itemType.slice(1)} not found`;
          if (args.id) errorMsg += ` with ID "${args.id}"`;
          if (args.name) errorMsg += `${args.id ? ' or' : ' with'} name "${args.name}"`;
          errorMsg += '.';
        } else {
          errorMsg += `: ${result.error}`;
        }
      }
      
      return {
        content: [{
          type: "text" as const,
          text: formatJsonError("backend_execution_error", errorMsg)
        }],
        isError: true
      };
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`Tool execution error: ${error.message}`);
    
    return {
      content: [{
        type: "text" as const,
        text: formatJsonError("backend_execution_error", `Error removing: ${error.message}`)
      }],
      isError: true
    };
  }
} 