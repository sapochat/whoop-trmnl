export const OAUTH_STATE_COOKIE = 'whoop_oauth_state';

export function getCanonicalOrigin(requestUrl: string): string {
  const configuredUrl = process.env.NEXTAUTH_URL?.trim();
  return new URL(configuredUrl || requestUrl).origin;
}

export function getCanonicalUrl(path: string, requestUrl: string): string {
  return new URL(path, getCanonicalOrigin(requestUrl)).toString();
}

export function isCanonicalRequest(requestUrl: string): boolean {
  return new URL(requestUrl).origin === getCanonicalOrigin(requestUrl);
}

export function createOAuthState(origin: string): string {
  const canonicalOrigin = new URL(origin).origin;
  return `${crypto.randomUUID()}.${encodeURIComponent(canonicalOrigin)}`;
}

export function validateOAuthState(
  state: string | null,
  storedState: string | undefined,
  requestUrl: string
): boolean {
  if (!state || !storedState || state !== storedState) {
    return false;
  }

  const separator = state.indexOf('.');
  if (separator < 1) {
    return false;
  }

  try {
    const stateOrigin = new URL(decodeURIComponent(state.slice(separator + 1))).origin;
    const requestOrigin = new URL(requestUrl).origin;
    const canonicalOrigin = getCanonicalOrigin(requestUrl);
    return stateOrigin === canonicalOrigin && requestOrigin === canonicalOrigin;
  } catch {
    return false;
  }
}

export function getOAuthStateCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}
