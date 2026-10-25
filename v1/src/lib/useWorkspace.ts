'use client';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { emptyWorkspace, type Workspace } from '../domain/models';
import { restoreWorkspace, saveWorkspace, deleteWorkspace } from './storage';
export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  useEffect(() => {
    let result;
    try {
      result = restoreWorkspace(window.localStorage);
    } catch {
      result = {
        workspace: emptyWorkspace(),
        warning: 'Browser storage is unavailable. Export your planner before leaving.',
        recovery: null,
      };
    }
    // Browser storage can only be read after hydration; restoring this external state requires a render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWorkspace(result.workspace);
    setWarning(result.warning);
    setRecovery(result.recovery);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || recovery !== null) return;
    let failure: string | null = null;
    try {
      failure = saveWorkspace(window.localStorage, workspace);
    } catch {
      failure = 'Browser storage is unavailable. Export your planner before leaving.';
    }
    // Report the result of synchronizing with the external browser storage system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWarning(failure);
  }, [workspace, ready, recovery]);
  function reset() {
    try {
      const error = deleteWorkspace(window.localStorage);
      if (error) {
        setWarning(error);
        return false;
      }
    } catch {
      setWarning('Browser storage is unavailable. Your saved data could not be deleted.');
      return false;
    }
    setRecovery(null);
    setWorkspace(emptyWorkspace());
    setWarning(null);
    return true;
  }
  return {
    workspace,
    update: setWorkspace as Dispatch<SetStateAction<Workspace>>,
    ready,
    warning,
    recovery,
    reset,
  };
}
