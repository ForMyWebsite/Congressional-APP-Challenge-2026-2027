import { emptyWorkspace, workspaceSchema, type Workspace } from '../domain/models';
export const STORAGE_KEY = 'acadia-workspace-v2';
export function deleteWorkspace(storage: StorageLike): string | null {
  try {
    storage.removeItem(STORAGE_KEY);
    if (storage.getItem(STORAGE_KEY) !== null) throw new Error('Deletion did not persist.');
    return null;
  } catch {
    return 'Your browser could not delete the stored planner. Check site storage permissions and try again. Your data has not been claimed deleted.';
  }
}
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type RestoreResult = {
  workspace: Workspace;
  warning: string | null;
  recovery: string | null;
};
export function restoreWorkspace(storage: StorageLike): RestoreResult {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { workspace: emptyWorkspace(), warning: null, recovery: null };
    const result = workspaceSchema.safeParse(JSON.parse(raw));
    if (result.success) return { workspace: result.data, warning: null, recovery: null };
    return {
      workspace: emptyWorkspace(),
      warning:
        'Your stored planner could not be read. It has not been overwritten. Download a recovery copy, or explicitly start fresh.',
      recovery: raw,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      let raw: string | null = null;
      try {
        raw = storage.getItem(STORAGE_KEY);
      } catch {}
      return {
        workspace: emptyWorkspace(),
        warning:
          'Your saved planner is corrupted. It has not been overwritten. Download a recovery copy or start fresh.',
        recovery: raw,
      };
    }
    return {
      workspace: emptyWorkspace(),
      warning:
        'Browser storage is unavailable. Changes will not survive closing this page. Export your planner before leaving.',
      recovery: null,
    };
  }
}
export function saveWorkspace(storage: StorageLike, workspace: Workspace): string | null {
  const result = workspaceSchema.safeParse(workspace);
  if (!result.success)
    return 'Your planner failed validation and was not saved. Export a copy before leaving.';
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    return null;
  } catch {
    return 'Your browser could not save changes. Export your planner before leaving.';
  }
}
export function importWorkspace(raw: string): Workspace {
  if (new TextEncoder().encode(raw).length > 1_000_000)
    throw new Error('Planner files must be smaller than 1 MB.');
  return workspaceSchema.parse(JSON.parse(raw));
}
