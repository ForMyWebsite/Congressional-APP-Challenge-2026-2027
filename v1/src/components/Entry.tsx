'use client';
import { useEffect, useState } from 'react';
import { browserSupabase } from '../lib/supabase';
import { Welcome } from './Welcome';
import { WorkspaceApp } from './WorkspaceApp';
export function Entry() {
  const [session, setSession] = useState<{ ready: boolean; userId: string | null; guest: boolean }>(
    { ready: false, userId: null, guest: false },
  );
  useEffect(() => {
    let active = true;
    const client = browserSupabase();
    async function load() {
      let userId: string | null = null;
      if (client) {
        try {
          const { data } = await client.auth.getUser();
          userId = data.user?.id || null;
        } catch {
          userId = null;
        }
      }
      let guest = false;
      try {
        guest = sessionStorage.getItem('acadia-guest') === 'true';
      } catch {}
      if (active) setSession({ ready: true, userId, guest });
    }
    void load();
    return () => {
      active = false;
    };
  }, []);
  if (!session.ready)
    return (
      <main className="loading-state" role="status">
        Opening Acadia…
      </main>
    );
  if (!session.userId && !session.guest)
    return (
      <Welcome
        onGuest={() => {
          try {
            sessionStorage.setItem('acadia-guest', 'true');
          } catch {}
          setSession({ ...session, guest: true });
        }}
      />
    );
  return <WorkspaceApp key={session.userId || 'guest'} userId={session.userId} />;
}
