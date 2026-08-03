import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { getAccessToken, storeTokenData } = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  storeTokenData: vi.fn(),
}));

vi.mock('@/lib/whoop/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/whoop/api')>();
  return { ...actual, getAccessToken };
});

vi.mock('@/lib/kv', () => ({ storeTokenData }));

import { GET as initiateOAuth } from './route';
import { GET as handleCallback } from './callback/route';
import { createOAuthState, OAUTH_STATE_COOKIE } from '@/lib/whoop/oauth-state';

function request(url: string, stateCookie?: string) {
  return new NextRequest(url, {
    headers: stateCookie
      ? { cookie: `${OAUTH_STATE_COOKIE}=${encodeURIComponent(stateCookie)}` }
      : undefined,
  });
}

describe('OAuth routes', () => {
  beforeEach(() => {
    vi.stubEnv('NEXTAUTH_URL', 'https://whoop.example');
    vi.stubEnv('WHOOP_CLIENT_ID', 'test-client');
    getAccessToken.mockResolvedValue({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('initiates OAuth on the matching canonical host', async () => {
    const response = await initiateOAuth(request('https://whoop.example/api/auth'));
    const location = new URL(response.headers.get('location')!);

    expect(location.origin + location.pathname).toBe(
      'https://api.whoop.com/oauth/authorize'
    );
    expect(location.searchParams.get('redirect_uri')).toBe(
      'https://whoop.example/api/auth/callback'
    );
    expect(location.searchParams.get('state')).toBeTruthy();
    expect(response.cookies.get(OAUTH_STATE_COOKIE)?.value).toBe(
      location.searchParams.get('state')
    );
  });

  it('redirects mismatched initiation requests to the canonical route', async () => {
    const response = await initiateOAuth(request('https://preview.example/api/auth'));

    expect(response.headers.get('location')).toBe('https://whoop.example/api/auth');
    expect(response.cookies.get(OAUTH_STATE_COOKIE)).toBeUndefined();
  });

  it('rejects a callback with missing state', async () => {
    const response = await handleCallback(
      request('https://whoop.example/api/auth/callback?code=test-code')
    );

    expect(response.status).toBe(400);
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it('rejects a callback with mismatched state', async () => {
    const storedState = createOAuthState('https://whoop.example');
    const response = await handleCallback(
      request(
        'https://whoop.example/api/auth/callback?code=test-code&state=other-state',
        storedState
      )
    );

    expect(response.status).toBe(400);
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it('rejects matching state presented on a different callback host', async () => {
    const state = createOAuthState('https://whoop.example');
    const response = await handleCallback(
      request(
        `https://preview.example/api/auth/callback?code=test-code&state=${encodeURIComponent(state)}`,
        state
      )
    );

    expect(response.status).toBe(400);
    expect(getAccessToken).not.toHaveBeenCalled();
  });

  it('accepts matching state and redirects to the canonical success page', async () => {
    const state = createOAuthState('https://whoop.example');
    const response = await handleCallback(
      request(
        `https://whoop.example/api/auth/callback?code=test-code&state=${encodeURIComponent(state)}`,
        state
      )
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://whoop.example/auth/success');
    expect(getAccessToken).toHaveBeenCalledWith(
      'test-code',
      'https://whoop.example/api/auth/callback?code=test-code&state=' +
        encodeURIComponent(state)
    );
    expect(storeTokenData).toHaveBeenCalledOnce();
  });
});
