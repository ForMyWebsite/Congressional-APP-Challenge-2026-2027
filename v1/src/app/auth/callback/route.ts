import { callbackOrigin } from '../../../lib/server/origin';
import { NextResponse } from 'next/server';
import { serverSupabase } from '../../../lib/server/supabase';
export async function GET(request: Request) {
  const url = new URL(request.url);
  let origin: string;
  try {
    origin = callbackOrigin(request);
  } catch {
    return Response.json(
      { error: 'Configure ACADIA_APP_ORIGIN for this deployment.' },
      { status: 503 },
    );
  }
  const code = url.searchParams.get('code');
  const supabase = await serverSupabase();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL('/', origin));
  }
  return NextResponse.redirect(
    new URL('/?authError=Sign-in+could+not+be+completed.+Please+try+again.', origin),
  );
}
