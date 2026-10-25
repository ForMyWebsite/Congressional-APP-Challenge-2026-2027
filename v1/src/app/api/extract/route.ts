import { validOrigin, readJSON } from '../../../lib/server/http';
import { callModel } from '../../../lib/server/provider';
import { z } from 'zod';
import { validateImage } from '../../../lib/server/image';
import { modelAccess } from '../../../lib/server/max';
export async function POST(request: Request) {
  if (!validOrigin(request))
    return Response.json({ error: 'Request origin is not allowed.' }, { status: 403 });
  const access = await modelAccess('extract');
  if ('error' in access) return Response.json({ error: access.error }, { status: access.status });
  try {
    const body = z
      .object({ image: z.string(), consent: z.literal(true) })
      .parse(await readJSON(request, 5800000));
    const image = validateImage(body.image);
    const reply = await callModel(
      access.key,
      [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Extract the visible schedule or class information for editable review.',
            },
            { type: 'input_image', image_url: image, detail: 'high' },
          ],
        },
      ],
      'extract',
    );
    return Response.json(reply);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Could not read the image.' },
      { status: 400 },
    );
  }
}
