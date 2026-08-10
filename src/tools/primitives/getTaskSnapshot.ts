import { getTaskById, type TaskInfo } from './getTaskById.js';

export const INTERNAL_TASK_SNAPSHOT_TOOL = '_internal_get_task_snapshot';
export type TaskSnapshot = { id: string; name: string; note: string; dueDate: string | null; deferDate: string | null; plannedDate: string | null; flagged: boolean; estimatedMinutes: number | null; completed: boolean; projectId: string | null; parentId: string | null; tags: string[] };
export type TaskSnapshotResult = { status: 'found'; task: TaskSnapshot } | { status: 'unknown'; reason: string };
type Lookup = (params: { taskId: string }) => Promise<{ success: boolean; task?: TaskInfo; error?: string }>;

export async function getTaskSnapshot(taskId: string, lookup: Lookup = getTaskById): Promise<TaskSnapshotResult> {
  try {
    const result = await lookup({ taskId });
    if (!result.success || !result.task) return { status: 'unknown', reason: result.error || 'exact task snapshot lookup failed' };
    const task = result.task;
    if (task.id !== taskId) return { status: 'unknown', reason: 'exact task snapshot returned a different task ID' };
    return { status: 'found', task: {
      id: task.id, name: task.name, note: task.note,
      dueDate: task.dueDate ?? null, deferDate: task.deferDate ?? null,
      plannedDate: task.plannedDate ?? null, flagged: task.flagged,
      estimatedMinutes: task.estimatedMinutes ?? null, completed: task.completed,
      projectId: task.projectId ?? null, parentId: task.parentId ?? null, tags: [...task.tags],
    } };
  } catch (error) {
    return { status: 'unknown', reason: `exact task snapshot lookup failed: ${(error as Error).message}` };
  }
}
