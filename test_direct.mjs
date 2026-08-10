import { getInboxTasks } from "./dist/tools/primitives/getInboxTasks.js";
async function run() {
    console.log("Fetching inbox tasks...");
    try {
        const res = await getInboxTasks();
        console.log("Result:", res);
    } catch(e) {
        console.error("Error:", e);
    }
}
run();
