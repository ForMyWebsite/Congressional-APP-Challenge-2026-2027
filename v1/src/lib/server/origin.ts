export function callbackOrigin(request: Request): string {
  const configured = process.env.ACADIA_APP_ORIGIN;
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
      throw new Error('ACADIA_APP_ORIGIN must use HTTPS.');
    return url.origin;
  }
  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN)
    return `https://${process.env.CODESPACE_NAME}-5173.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  const url = new URL(request.url);
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) return url.origin;
  throw new Error('Set ACADIA_APP_ORIGIN to the app’s exact HTTPS origin.');
}
