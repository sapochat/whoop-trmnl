import axios from 'axios';

// WHOOP API base URL
const WHOOP_API_BASE_URL = 'https://api.whoop.com/v1';

// OAuth configuration
const CLIENT_ID = process.env.WHOOP_CLIENT_ID;
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback` : 'http://localhost:3000/api/auth/callback';
const AUTH_URL = 'https://api.whoop.com/oauth/authorize';
const TOKEN_URL = 'https://api.whoop.com/oauth/token';

// Types
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface CycleData {
  cycle_id: string;
  [key: string]: any;
}

export interface RecoveryData {
  user_calibrating: boolean;
  recovery_score: number;
  resting_heart_rate: number;
  hrv_rmssd_milli: number;
  spo2_percentage?: number;
  skin_temp_celsius?: number;
  [key: string]: any;
}

export interface SleepData {
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_sleep_time_milli: number;
      total_wake_time_milli: number;
      sleep_efficiency: number;
      sleep_needed_milli: number;
    };
  };
  [key: string]: any;
}

export interface HrvDataPoint {
  date: string;
  value: number;
}

/**
 * Generate the OAuth authorization URL
 * @returns {string} The authorization URL
 */
export function getAuthUrl(): string {
  const scopes = ['read:cycles', 'read:recovery', 'read:sleep', 'read:hrv'];
  return `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes.join(' '))}`;
}

/**
 * Exchange the authorization code for an access token
 * @param {string} code - The authorization code
 * @returns {Promise<TokenResponse>} The access token response
 */
export async function getAccessToken(code: string): Promise<TokenResponse> {
  try {
    const response = await axios.post(TOKEN_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });
    return response.data;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * Refresh the access token
 * @param {string} refreshToken - The refresh token
 * @returns {Promise<TokenResponse>} The new access token response
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  try {
    const response = await axios.post(TOKEN_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    return response.data;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

/**
 * Get the latest cycle
 * @param {string} accessToken - The access token
 * @returns {Promise<CycleData>} The latest cycle data
 */
export async function getLatestCycle(accessToken: string): Promise<CycleData> {
  try {
    const response = await axios.get(`${WHOOP_API_BASE_URL}/cycle`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting latest cycle:', error);
    throw error;
  }
}

/**
 * Get recovery data for a specific cycle
 * @param {string} accessToken - The access token
 * @param {string} cycleId - The cycle ID
 * @returns {Promise<RecoveryData>} The recovery data
 */
export async function getRecoveryForCycle(accessToken: string, cycleId: string): Promise<RecoveryData> {
  try {
    const response = await axios.get(`${WHOOP_API_BASE_URL}/cycle/${cycleId}/recovery`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recovery for cycle:', error);
    throw error;
  }
}

/**
 * Get historical recovery data for the last 7 days
 * @param {string} accessToken - The access token
 * @returns {Promise<Array<RecoveryData>>} The historical recovery data
 */
export async function getHistoricalRecoveryData(accessToken: string): Promise<RecoveryData[]> {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await axios.get(`${WHOOP_API_BASE_URL}/recovery/collection`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting historical recovery data:', error);
    throw error;
  }
}

/**
 * Get sleep data
 * @param {string} accessToken - The access token
 * @returns {Promise<SleepData>} The sleep data
 */
export async function getSleepData(accessToken: string): Promise<SleepData> {
  try {
    const response = await axios.get(`${WHOOP_API_BASE_URL}/activity/sleep/collection`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        limit: 1
      }
    });
    return response.data[0];
  } catch (error) {
    console.error('Error getting sleep data:', error);
    throw error;
  }
}

/**
 * Get all WHOOP data needed for the dashboard
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} All the data needed for the dashboard
 */
export async function getAllDashboardData(accessToken: string) {
  try {
    const cycleData = await getLatestCycle(accessToken);
    const recoveryData = await getRecoveryForCycle(accessToken, cycleData.cycle_id);
    const hrvData = await getHistoricalRecoveryData(accessToken);
    const sleepData = await getSleepData(accessToken);

    return {
      cycleData,
      recoveryData,
      hrvData,
      sleepData
    };
  } catch (error) {
    console.error('Error getting all dashboard data:', error);
    throw error;
  }
}
