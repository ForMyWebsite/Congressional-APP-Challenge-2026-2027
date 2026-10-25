export function GET() {
  return Response.json({
    status: 'ok',
    appVersion: 2,
    mode: 'guest',
    schoolConnections: false,
    liveAI: false,
  });
}
