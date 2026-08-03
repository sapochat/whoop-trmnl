import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/whoop/api';
import {
  createOAuthState,
  getCanonicalOrigin,
  getCanonicalUrl,
  getOAuthStateCookieOptions,
  isCanonicalRequest,
  OAUTH_STATE_COOKIE,
} from '@/lib/whoop/oauth-state';

/**
 * GET handler for the auth endpoint
 * Redirects the user to the WHOOP authorization page
 */
export async function GET(request: NextRequest) {
  try {
    if (!isCanonicalRequest(request.url)) {
      return NextResponse.redirect(getCanonicalUrl('/api/auth', request.url));
    }

    // Generate the authorization URL with a CSRF state token
    const state = createOAuthState(getCanonicalOrigin(request.url));
    const authUrl = getAuthUrl(state, request.url);
    
    // Redirect to the authorization URL
    const response = NextResponse.redirect(authUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, state, getOAuthStateCookieOptions());
    return response;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
