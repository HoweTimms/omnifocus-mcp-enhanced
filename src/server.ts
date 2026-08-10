#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool definitions
import * as dumpDatabaseTool from './tools/definitions/dumpDatabase.js';
import * as addOmniFocusTaskTool from './tools/definitions/addOmniFocusTask.js';
import * as addProjectTool from './tools/definitions/addProject.js';
import * as removeItemTool from './tools/definitions/removeItem.js';
import * as editItemTool from './tools/definitions/editItem.js';
import * as moveTaskTool from './tools/definitions/moveTask.js';
import * as batchAddItemsTool from './tools/definitions/batchAddItems.js';
import * as batchRemoveItemsTool from './tools/definitions/batchRemoveItems.js';
import * as getTaskByIdTool from './tools/definitions/getTaskById.js';
import * as readTaskAttachmentTool from './tools/definitions/readTaskAttachment.js';
import * as getTodayCompletedTasksTool from './tools/definitions/getTodayCompletedTasks.js';
import * as findTaskByIdempotencyMarkerTool from './tools/definitions/findTaskByIdempotencyMarker.js';
// Import perspective tools
import * as getInboxTasksTool from './tools/definitions/getInboxTasks.js';
import * as getFlaggedTasksTool from './tools/definitions/getFlaggedTasks.js';
import * as getForecastTasksTool from './tools/definitions/getForecastTasks.js';
import * as getTasksByTagTool from './tools/definitions/getTasksByTag.js';
// Import ultimate filter tool
import * as filterTasksTool from './tools/definitions/filterTasks.js';
// Import custom perspective tools
import * as listCustomPerspectivesTool from './tools/definitions/listCustomPerspectives.js';
import * as getCustomPerspectiveTasksTool from './tools/definitions/getCustomPerspectiveTasks.js';

// Create an MCP server
const server = new McpServer({
  name: "OmniFocus MCP",
  version: "1.6.9"
});


import { z } from "zod";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Register a tool with localized inference decoupling.
 * This explicit wrapper prevents the internal TypeScript resolver from hanging 
 * on an exploding intersection union by enforcing a localized closure boundary around Zod properties.
 */
function registerTool<T extends z.ZodRawShape>(
  name: string,
  description: string,
  shape: T,
  handler: (args: any, extra: RequestHandlerExtra) => Promise<CallToolResult>
) {
  server.tool(name, description, shape, handler as any);
}

// Register tools
registerTool(
  "dump_database",
  "Gets the current state of your OmniFocus database",
  dumpDatabaseTool.schema.shape,
  dumpDatabaseTool.handler
);

registerTool(
  "add_omnifocus_task",
  "Add a new task to OmniFocus",
  addOmniFocusTaskTool.schema.shape,
  addOmniFocusTaskTool.handler
);

registerTool(
  "add_project",
  "Add a new project to OmniFocus",
  addProjectTool.schema.shape,
  addProjectTool.handler
);

registerTool(
  "remove_item",
  "Remove a task or project from OmniFocus",
  removeItemTool.schema.shape,
  removeItemTool.handler
);

registerTool(
  "edit_item",
  "Edit a task or project in OmniFocus",
  editItemTool.schema.shape,
  editItemTool.handler
);

registerTool(
  "move_task",
  "Move an existing task to a project, parent task, or inbox",
  moveTaskTool.schema.shape,
  moveTaskTool.handler
);

registerTool(
  "batch_add_items",
  "Add multiple tasks or projects to OmniFocus in a single operation",
  batchAddItemsTool.schema.shape,
  batchAddItemsTool.handler
);

registerTool(
  "batch_remove_items",
  "Remove multiple tasks or projects from OmniFocus in a single operation",
  batchRemoveItemsTool.schema.shape,
  batchRemoveItemsTool.handler
);


registerTool(
  "get_task_by_id",
  "Get information about a specific task by ID or name",
  getTaskByIdTool.schema.shape,
  getTaskByIdTool.handler
);

registerTool(
  "read_task_attachment",
  "Read a task attachment reported by get_task_by_id. Images are returned as MCP image content when possible.",
  readTaskAttachmentTool.schema.shape,
  readTaskAttachmentTool.handler
);

registerTool(
  "get_today_completed_tasks",
  "Get tasks completed today - view today's accomplishments",
  getTodayCompletedTasksTool.schema.shape,
  getTodayCompletedTasksTool.handler
);

// Private reconciliation capability for the local HTTP hub. The hub's exact
// public allowlist must never advertise this implementation-only tool.
registerTool(
  findTaskByIdempotencyMarkerTool.INTERNAL_IDEMPOTENCY_LOOKUP_TOOL,
  "Internal exact idempotency marker lookup",
  findTaskByIdempotencyMarkerTool.schema.shape,
  findTaskByIdempotencyMarkerTool.handler
);

// Register perspective tools
registerTool(
  "get_inbox_tasks",
  "Get tasks from OmniFocus inbox perspective",
  getInboxTasksTool.schema.shape,
  getInboxTasksTool.handler
);

registerTool(
  "get_flagged_tasks", 
  "Get flagged tasks from OmniFocus with optional project filtering",
  getFlaggedTasksTool.schema.shape,
  getFlaggedTasksTool.handler
);

registerTool(
  "get_forecast_tasks",
  "Get tasks from OmniFocus forecast perspective (due/deferred tasks in date range)", 
  getForecastTasksTool.schema.shape,
  getForecastTasksTool.handler
);

registerTool(
  "get_tasks_by_tag",
  "Get tasks filtered by OmniFocus tags (labels like @home, @work, @urgent). Use this for tag-based filtering, NOT for custom perspective names. Tags are labels assigned to individual tasks.",
  getTasksByTagTool.schema.shape, 
  getTasksByTagTool.handler
);

// Ultimate filter tool - The most powerful task perspective engine
registerTool(
  "filter_tasks",
  "Advanced task filtering with unlimited perspective combinations - status, dates, projects, tags, search, and more",
  filterTasksTool.schema.shape,
  filterTasksTool.handler
);

// Custom perspective tools
registerTool(
  "list_custom_perspectives",
  "List all custom perspectives defined in OmniFocus",
  listCustomPerspectivesTool.schema.shape,
  listCustomPerspectivesTool.handler
);

registerTool(
  "get_custom_perspective_tasks",
  "Get tasks from a specific OmniFocus custom perspective by name. Use this when user refers to perspective names like '今日工作安排', '今日复盘', '本周项目' etc. - these are custom views created in OmniFocus, NOT tags. Supports hierarchical tree display of task relationships.",
  getCustomPerspectiveTasksTool.schema.shape,
  getCustomPerspectiveTasksTool.handler
);

// Start the MCP server
const transport = new StdioServerTransport();

// Use await with server.connect to ensure proper connection
(async function() {
  try {
    await server.connect(transport);
  } catch (err) {
    console.error(`Failed to start MCP server: ${err}`);
  }
})();

// For a cleaner shutdown if the process is terminated
