import { executeOmniFocusScript } from '../../utils/scriptExecution.js';

export interface GetInboxTasksOptions {
  hideCompleted?: boolean;
}

export async function getInboxTasks(options: GetInboxTasksOptions = {}): Promise<any> {
  const { hideCompleted = true } = options;

  try {
    // Execute the inbox script
    const result = await executeOmniFocusScript('@inboxTasks.js', {
      hideCompleted: hideCompleted
    });

    if (typeof result === 'string') {
      return result;
    }

    // If result is an object, format it
    if (result && typeof result === 'object') {
      const data = result as any;

      if (data.error) {
        throw new Error(data.error);
      }

return data.tasks || [];
    }

    return 'Unexpected result format from OmniFocus';
  } catch (error) {
    console.error('Error in getInboxTasks:', error);
    throw new Error(`Failed to get inbox tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
