export function GET() {
  return Response.json({
    status: 'ok',
    appVersion: 3,
    mode:
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? 'accounts-configured'
        : 'guest',
    schoolConnections: false,
    liveAI: false,
  });
}
