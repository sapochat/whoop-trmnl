import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createOAuthState,
  getCanonicalOrigin,
  getCanonicalUrl,
  validateOAuthState,
} from './oauth-state';

describe('OAuth canonical origin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses NEXTAUTH_URL when the request origin matches', () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://whoop.example');

    expect(getCanonicalOrigin('https://whoop.example/api/auth')).toBe(
      'https://whoop.example'
    );
    expect(getCanonicalUrl('/api/auth/callback', 'https://whoop.example/api/auth')).toBe(
      'https://whoop.example/api/auth/callback'
    );
  });

  it('falls back to the request origin when NEXTAUTH_URL is missing', () => {
    vi.stubEnv('NEXTAUTH_URL', '');

    expect(getCanonicalOrigin('https://preview.example/api/auth')).toBe(
      'https://preview.example'
    );
  });

  it('uses NEXTAUTH_URL when the request origin is mismatched', () => {
    vi.stubEnv('NEXTAUTH_URL', 'https://whoop.example/base-path');

    expect(getCanonicalOrigin('https://preview.example/api/auth')).toBe(
      'https://whoop.example'
    );
  });

  it('rejects state on a different callback host when NEXTAUTH_URL is missing', () => {
    vi.stubEnv('NEXTAUTH_URL', '');
    const state = createOAuthState('https://whoop.example');

    expect(
      validateOAuthState(
        state,
        state,
        'https://preview.example/api/auth/callback?code=test'
      )
    ).toBe(false);
  });
});
