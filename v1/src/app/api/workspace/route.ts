import { validOrigin, readJSON } from '../../../lib/server/http';
import { z } from 'zod';
import { serverSupabase } from '../../../lib/server/supabase';
import { workspaceSchema } from '../../../domain/models';
async function session() {
  const client = await serverSupabase();
  if (!client) return null;
  const {
    data: { user },
  } = await client.auth.getUser();
  return user ? { client, user } : null;
}
export async function GET() {
  const auth = await session();
  if (!auth)
    return Response.json({ error: 'Sign in to load your cloud planner.' }, { status: 401 });
  const { data, error } = await auth.client
    .from('acadia_workspaces')
    .select('state,revision')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (error)
    return Response.json(
      { error: 'Cloud storage could not be read. Verify the database migration and policies.' },
      { status: 503 },
    );
  if (!data) return Response.json({ state: null, revision: 0 });
  const parsed = workspaceSchema.safeParse(data.state);
  if (!parsed.success)
    return Response.json(
      { error: 'Your cloud planner needs recovery. It has not been overwritten.' },
      { status: 422 },
    );
  return Response.json({ state: parsed.data, revision: data.revision });
}
export async function PUT(request: Request) {
  if (!validOrigin(request))
    return Response.json({ error: 'Request origin is not allowed.' }, { status: 403 });
  const auth = await session();
  if (!auth) return Response.json({ error: 'Sign in to save your planner.' }, { status: 401 });
  try {
    const parsed = z
      .object({ state: workspaceSchema, revision: z.number().int().min(0) })
      .safeParse(await readJSON(request, 2000000));
    if (!parsed.success) return Response.json({ error: 'Invalid planner data.' }, { status: 400 });
    const { data, error } = await auth.client.rpc('save_acadia_workspace', {
      payload: parsed.data.state,
      expected_revision: parsed.data.revision,
    });
    if (error)
      return Response.json(
        {
          error:
            error.code === '40001'
              ? 'Your planner changed in another tab. Export your changes, then reload before saving.'
              : 'Cloud save failed. Check the migration and try again.',
        },
        { status: error.code === '40001' ? 409 : 503 },
      );
    return Response.json({ revision: data });
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
export async function DELETE(request: Request) {
  if (!validOrigin(request))
    return Response.json({ error: 'Request origin is not allowed.' }, { status: 403 });
  const auth = await session();
  if (!auth) return Response.json({ error: 'Sign in first.' }, { status: 401 });
  try {
    if ((await request.json()).confirmation !== 'DELETE')
      return Response.json({ error: 'Explicit confirmation required.' }, { status: 400 });
  } catch {
    return Response.json({ error: 'Confirmation required.' }, { status: 400 });
  }
  const { error } = await auth.client
    .from('acadia_workspaces')
    .delete()
    .eq('user_id', auth.user.id);
  return error
    ? Response.json({ error: 'Could not delete cloud planner.' }, { status: 503 })
    : Response.json({ ok: true });
}
