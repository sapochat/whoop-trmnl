import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/kv';
import * as whoopApi from '@/lib/whoop/api';
import { processDashboardData } from '@/lib/whoop/utils';
import { generateDashboardHtml, generateAuthHtml, generateErrorHtml } from '@/lib/template';

// Default user ID (for simplicity in this example)
// In a production app, you would use a real user ID system
const DEFAULT_USER_ID = 'default-user';

/**
 * GET handler for the dashboard endpoint
 * This is the main endpoint that TRMNL will poll
 */
export async function GET(request: NextRequest) {
  try {
    // Get token data from KV store
    const tokenData = await getTokenData(DEFAULT_USER_ID);
    
    // If no token data, return auth page
    if (!tokenData) {
      const authUrl = whoopApi.getAuthUrl();
      const html = generateAuthHtml(authUrl);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      try {
        // Try to refresh the token
        const refreshedToken = await whoopApi.refreshAccessToken(tokenData.refreshToken);
        
        // Update token data in KV store
        await getTokenData(DEFAULT_USER_ID);
        
        // Continue with the refreshed token
        tokenData.accessToken = refreshedToken.access_token;
        tokenData.refreshToken = refreshedToken.refresh_token;
        tokenData.expiresAt = Date.now() + (refreshedToken.expires_in * 1000);
      } catch (error) {
        // If refresh fails, return auth page
        console.error('Error refreshing token:', error);
        const authUrl = whoopApi.getAuthUrl();
        const html = generateAuthHtml(authUrl);
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }
    }
    
    // Fetch data from WHOOP API
    const { cycleData, recoveryData, hrvData, sleepData } = await whoopApi.getAllDashboardData(tokenData.accessToken);
    
    // Process data for display
    const processedData = processDashboardData(recoveryData, hrvData, sleepData);
    
    // Generate HTML
    const html = generateDashboardHtml(processedData);
    
    // Return HTML response
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating dashboard:', error);
    
    // Generate error HTML
    const html = generateErrorHtml(
      'Error fetching WHOOP data',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
    
    // Return error HTML
    return new NextResponse(html, {
      status: 200, // Still return 200 so TRMNL displays the error
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}
