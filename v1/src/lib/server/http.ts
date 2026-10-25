export function validOrigin(request: Request) {
  try {
    const origin = request.headers.get('origin');
    return (
      request.headers.get('x-acadia-request') === '1' &&
      (!origin ||
        new URL(origin).host === request.headers.get('host') ||
        new URL(origin).origin === new URL(request.url).origin)
    );
  } catch {
    return false;
  }
}

export async function readJSON(request: Request, limit: number): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Request body is missing.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error('Request body is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
