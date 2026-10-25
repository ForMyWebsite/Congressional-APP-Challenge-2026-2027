import { serverSupabase } from './supabase';
const counters = new Map<string, { count: number; expires: number }>();
export async function modelAccess(scope: string) {
  const key = process.env.ACADIA_AI_API_KEY;
  if (!key)
    return {
      error:
        'Max’s AI provider is not configured. Add ACADIA_AI_API_KEY to the server environment and restart.',
      status: 503,
    } as const;
  const client = await serverSupabase();
  const user = client ? (await client.auth.getUser()).data.user : null;
  if (!user && process.env.ACADIA_ALLOW_GUEST_AI !== 'true')
    return {
      error: 'Sign in to use Max. Private previews can explicitly enable ACADIA_ALLOW_GUEST_AI.',
      status: 401,
    } as const;
  const now = Date.now();
  for (const [id, entry] of counters) if (entry.expires < now) counters.delete(id);
  const id = `${scope}:${user?.id || 'guest'}`;
  const entry = counters.get(id) || { count: 0, expires: now + 15 * 60_000 };
  entry.count++;
  counters.set(id, entry);
  if (entry.count > (scope === 'extract' ? 6 : 30))
    return { error: 'Max needs a short break. Try again in 15 minutes.', status: 429 } as const;
  return { key } as const;
}
