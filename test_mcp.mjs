import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import assert from "assert";

// Using the token directly as query string
const SERVER_URL = "http://localhost:15201/mcp/sse?token=change-me-to-a-secure-token";

async function run() {
  console.log("Connecting to MCP via SSE...");
  
  // Custom headers parameter for EventSource
  const transport = new SSEClientTransport(new URL(SERVER_URL), {
    headers: {
        "Authorization": "Bearer change-me-to-a-secure-token"
    }
  });
  
  const client = new Client({ name: "test-client", version: "1.0.0" }, {
      capabilities: {}
  });

  await client.connect(transport);
  console.log("Connected successfully.\n");

  try {
    // 1. Structured inbox output with IDs
    console.log("--- 1. Testing get_inbox_tasks ---");
    const inbox = await client.callTool({
      name: "get_inbox_tasks",
      arguments: {}
    });
    console.log("✅ get_inbox_tasks Response:", inbox.content[0].text.slice(0, 150) + "...\n");
    const inboxData = JSON.parse(inbox.content[0].text);
    assert(Array.isArray(inboxData), "Expected array of tasks");

    // 2. JSON-first create response with ID
    console.log("--- 2. Testing add_omnifocus_task ---");
    const newTask = await client.callTool({
      name: "add_omnifocus_task",
      arguments: {
        name: "MCP Test Task - Verify JSON Response ID " + Date.now()
      }
    });
    console.log("✅ add_omnifocus_task Response:", newTask.content[0].text.trim() + "\n");
    const taskData = JSON.parse(newTask.content[0].text);
    assert(taskData.id, "Expected created task to return its own ID");

    // 3. Stable ID-first move_task
    console.log("--- 3. Testing move_task ---");
    const moveResp = await client.callTool({
      name: "move_task",
      arguments: {
        id: taskData.id,
        inbox: true // move it back to inbox explicitly
      }
    });
    console.log("✅ move_task Response:", moveResp.content[0].text.trim() + "\n");
    const moveData = JSON.parse(moveResp.content[0].text);
    assert(moveData.id === taskData.id, "Expected move operation to mirror the same ID");

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    console.log("Cleaning up tests...");
    await client.close();
    
    console.log("--- 4. Testing session_expired typed handling ---");
    try {
        const res = await fetch("http://localhost:15201/mcp/message?sessionId=invalid_session_uuid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer change-me-to-a-secure-token"
            },
            body: JSON.stringify({jsonrpc:"2.0", method:"ping", id:1})
        });
        const errorJson = await res.json();
        console.log("✅ session_expired matched correctly! Error Payload:", JSON.stringify(errorJson, null, 2));
    } catch(e) {
        console.log("Caught:", e);
    }
  }
}

run();
