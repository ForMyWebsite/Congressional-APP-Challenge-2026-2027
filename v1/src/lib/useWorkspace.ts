'use client';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { emptyWorkspace, workspaceSchema, type Workspace } from '../domain/models';
import { awardTaskCoins } from '../domain/pet';
import { restoreWorkspace, saveWorkspace, deleteWorkspace } from './storage';
export async function workspaceRequest(method = 'GET', body?: unknown) {
  const response = await fetch('/api/workspace', {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Acadia-Request': '1' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Cloud storage is unavailable.');
  return data;
}
export function useWorkspace(userId: string | null = null) {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState(
    userId ? 'Loading cloud planner…' : 'Saved on this browser',
  );
  const revision = useRef(0);
  const saved = useRef('');
  const blocked = useRef(false);
  const active = useRef(true);
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    active.current = true;
    async function restore() {
      try {
        if (userId) {
          const result = await workspaceRequest();
          if (!active.current) return;
          const state = result.state ? workspaceSchema.parse(result.state) : emptyWorkspace();
          revision.current = result.revision;
          saved.current = result.state ? JSON.stringify(state) : '';
          setWorkspace(state);
          setSyncStatus('Cloud planner loaded');
        } else {
          const result = restoreWorkspace(window.localStorage);
          if (!active.current) return;
          setWorkspace(result.workspace);
          setWarning(result.warning);
          setRecovery(result.recovery);
        }
      } catch (error) {
        if (!active.current) return;
        blocked.current = Boolean(userId);
        setWarning(
          (error as Error).message +
            ' Your existing data has not been overwritten. Reload to retry.',
        );
        setSyncStatus('Not connected');
      } finally {
        if (active.current) setReady(true);
      }
    }
    void restore();
    return () => {
      active.current = false;
    };
  }, [userId]);
  useEffect(() => {
    if (!ready || recovery !== null || blocked.current) return;
    if (!userId) {
      let error: string | null = null;
      try {
        error = saveWorkspace(window.localStorage, workspace);
      } catch {
        error = 'Browser storage is unavailable. Export before leaving.';
      }
      // This reports synchronization with external browser storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWarning(error);
      return;
    }
    const serialized = JSON.stringify(workspace);
    if (saved.current === serialized) return;
    // Cloud synchronization status is an external-system effect.
    setSyncStatus('Saving to your account…');
    const timer = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        if (!active.current || blocked.current) return;
        try {
          const result = await workspaceRequest('PUT', {
            state: workspace,
            revision: revision.current,
          });
          if (!active.current) return;
          revision.current = result.revision;
          saved.current = serialized;
          setSyncStatus('Saved to your account');
          setWarning(null);
        } catch (error) {
          if (!active.current) return;
          blocked.current = true;
          setWarning(
            (error as Error).message +
              ' Export your current planner before leaving; reload to retry.',
          );
          setSyncStatus('Not saved');
        }
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [workspace, ready, recovery, userId]);
  const update: Dispatch<SetStateAction<Workspace>> = (action) =>
    setWorkspace((current) =>
      awardTaskCoins(current, typeof action === 'function' ? action(current) : action),
    );
  function reset() {
    if (userId) return false;
    try {
      const error = deleteWorkspace(window.localStorage);
      if (error) {
        setWarning(error);
        return false;
      }
    } catch {
      setWarning('Browser storage could not be cleared.');
      return false;
    }
    setRecovery(null);
    setWorkspace(emptyWorkspace());
    setWarning(null);
    return true;
  }
  async function deleteCloud() {
    await queue.current;
    blocked.current = true;
    try {
      await workspaceRequest('DELETE', { confirmation: 'DELETE' });
      revision.current = 0;
      setWorkspace(emptyWorkspace());
      saved.current = '';
      setSyncStatus('Cloud planner deleted');
      setWarning(null);
    } finally {
      blocked.current = false;
    }
  }
  return { workspace, update, ready, warning, recovery, reset, syncStatus, deleteCloud };
}
