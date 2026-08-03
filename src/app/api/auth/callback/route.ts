import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/whoop/api';
import { storeTokenData } from '@/lib/kv';
import {
  getCanonicalUrl,
  getOAuthStateCookieOptions,
  OAUTH_STATE_COOKIE,
  validateOAuthState,
} from '@/lib/whoop/oauth-state';

// Default user ID (for simplicity in this example)
// In a production app, you would use a real user ID system
const DEFAULT_USER_ID = 'default-user';

/**
 * GET handler for the auth callback endpoint
 * Handles the OAuth callback from WHOOP
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
    
    // If no code is provided, return an error
    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      );
    }

    if (!validateOAuthState(state, storedState, request.url)) {
      const response = NextResponse.json(
        { error: 'Invalid authorization state' },
        { status: 400 }
      );
      response.cookies.set(OAUTH_STATE_COOKIE, '', {
        ...getOAuthStateCookieOptions(),
        maxAge: 0,
      });
      return response;
    }
    
    // Exchange the authorization code for an access token
    const tokenData = await getAccessToken(code, request.url);
    
    // Store the token data in the KV store
    await storeTokenData(DEFAULT_USER_ID, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    });
    
    // Redirect to the success page
    const response = NextResponse.redirect(getCanonicalUrl('/auth/success', request.url));
    response.cookies.set(OAUTH_STATE_COOKIE, '', {
      ...getOAuthStateCookieOptions(),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error('Error handling auth callback:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to authenticate with WHOOP' },
      { status: 500 }
    );
  }
}
