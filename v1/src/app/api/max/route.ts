import { validOrigin, readJSON } from '../../../lib/server/http';
import { callModel } from '../../../lib/server/provider';
import { maxRequestSchema } from '../../../domain/max';
import { modelAccess } from '../../../lib/server/max';
export async function GET() {
  return Response.json({
    provider: process.env.ACADIA_AI_PROVIDER === 'openai' ? 'OpenAI' : 'OpenRouter',
    configured: Boolean(process.env.ACADIA_AI_API_KEY),
    guestAllowed: process.env.ACADIA_ALLOW_GUEST_AI === 'true',
  });
}
export async function POST(request: Request) {
  if (!validOrigin(request))
    return Response.json({ error: 'Request origin is not allowed.' }, { status: 403 });
  const access = await modelAccess('chat');
  if ('error' in access) return Response.json({ error: access.error }, { status: access.status });
  try {
    const body = maxRequestSchema.parse(await readJSON(request, 150000));
    const input = [
      {
        role: 'user',
        content: JSON.stringify({
          studentContext: body.context,
          localDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(
            new Date(),
          ),
        }),
      },
      ...body.history,
      { role: 'user', content: body.question },
    ];
    const reply = await callModel(access.key, input, 'chat');
    return Response.json(reply);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Max is unavailable. Try again.' },
      { status: 502 },
    );
  }
}
