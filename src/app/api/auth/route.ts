import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/whoop/api';

/**
 * GET handler for the auth endpoint
 * Redirects the user to the WHOOP authorization page
 */
export async function GET(request: NextRequest) {
  try {
    // Generate the authorization URL
    const authUrl = getAuthUrl();
    
    // Redirect to the authorization URL
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
