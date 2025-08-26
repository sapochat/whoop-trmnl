import axios from 'axios';

// WHOOP API base URL - Using v2 API (v1 will be deprecated after October 1, 2025)
const WHOOP_API_BASE_URL = 'https://api.whoop.com/v2';

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
  cycle_id: string; // UUID in v2
  created_at: string;
  updated_at: string;
  start: string;
  end?: string;
  timezone: string;
  score?: RecoveryData;
  recovery?: RecoveryData;
}

export interface RecoveryData {
  user_calibrating: boolean;
  recovery_score: number;
  resting_heart_rate: number;
  hrv_rmssd_milli: number;
  spo2_percentage?: number;
  skin_temp_celsius?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SleepData {
  id: string; // UUID in v2
  score: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_sleep_time_milli: number;
      total_wake_time_milli: number;
      sleep_efficiency: number;
      sleep_needed_milli: number;
      rem_sleep_milli?: number;
      deep_sleep_milli?: number;
      light_sleep_milli?: number;
    };
  };
  created_at?: string;
  updated_at?: string;
  start?: string;
  end?: string;
  nap?: boolean;
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
 * Get the latest cycle collection
 * @param {string} accessToken - The access token
 * @returns {Promise<CycleData>} The latest cycle data
 */
export async function getLatestCycle(accessToken: string): Promise<CycleData> {
  try {
    // Get cycles from the last 7 days, sorted by start time descending
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const response = await axios.get(`${WHOOP_API_BASE_URL}/cycle`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        start: startDate,
        end: endDate,
        limit: 1,
        order: 'desc'
      }
    });
    
    // Return the first (most recent) cycle
    const cycles = response.data.records || response.data;
    return Array.isArray(cycles) ? cycles[0] : cycles;
  } catch (error) {
    console.error('Error getting latest cycle:', error);
    throw error;
  }
}

/**
 * Get recovery data for a specific cycle
 * @param {string} accessToken - The access token
 * @param {string} cycleId - The cycle ID (UUID in v2)
 * @returns {Promise<RecoveryData>} The recovery data
 */
export async function getRecoveryForCycle(accessToken: string, cycleId: string): Promise<RecoveryData> {
  try {
    // In v2, recovery data is part of the cycle endpoint response
    const response = await axios.get(`${WHOOP_API_BASE_URL}/cycle/${cycleId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    // Extract recovery score from the cycle data
    return response.data.score || response.data.recovery;
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
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // In v2, recovery data comes from the cycle collection
    const response = await axios.get(`${WHOOP_API_BASE_URL}/cycle`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        start: startDate,
        end: endDate,
        limit: 7,
        order: 'desc'
      }
    });
    
    // Extract recovery scores from cycles
    const cycles = response.data.records || response.data;
    return Array.isArray(cycles) 
      ? cycles.map(cycle => cycle.score || cycle.recovery).filter(Boolean)
      : [];
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
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const response = await axios.get(`${WHOOP_API_BASE_URL}/sleep`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        start: startDate,
        end: endDate,
        limit: 1,
        order: 'desc'
      }
    });
    
    const sleepData = response.data.records || response.data;
    return Array.isArray(sleepData) ? sleepData[0] : sleepData;
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
    // Fetch all data in parallel for better performance
    const [cycleData, hrvData, sleepData] = await Promise.all([
      getLatestCycle(accessToken),
      getHistoricalRecoveryData(accessToken),
      getSleepData(accessToken)
    ]);
    
    // Recovery data is now part of the cycle data in v2
    const recoveryData = cycleData?.score || cycleData?.recovery || await getRecoveryForCycle(accessToken, cycleData.cycle_id);

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
