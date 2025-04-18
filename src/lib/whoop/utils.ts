import { RecoveryData, SleepData } from './api';

// Types
export interface ProcessedDashboardData {
  recovery_score: number;
  recovery_status: string;
  recovery_color: string;
  resting_heart_rate: number;
  hrv_current: number;
  hrv_trend: Array<{
    date: string;
    value: number;
  }>;
  sleep_hours: string;
  sleep_needed: string;
  sleep_deficit: number;
  last_updated: string;
}

/**
 * Get recovery status based on score
 * @param score - The recovery score (0-100)
 * @returns The recovery status text
 */
export function getRecoveryStatus(score: number): string {
  if (score >= 67) return 'Well Recovered';
  if (score >= 34) return 'Moderately Recovered';
  return 'Under Recovered';
}

/**
 * Get recovery color based on score
 * @param score - The recovery score (0-100)
 * @returns The color code (green, yellow, red)
 */
export function getRecoveryColor(score: number): string {
  if (score >= 67) return 'green';
  if (score >= 34) return 'yellow';
  return 'red';
}

/**
 * Format sleep duration from milliseconds to human-readable string
 * @param milliseconds - The sleep duration in milliseconds
 * @returns Formatted string (e.g., "7h 30m")
 */
export function formatSleepDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Calculate sleep deficit/surplus in hours
 * @param actual - Actual sleep time in milliseconds
 * @param needed - Needed sleep time in milliseconds
 * @returns Sleep deficit/surplus in hours (negative for deficit)
 */
export function getSleepDeficit(actual: number, needed: number): number {
  const deficit = (actual - needed) / (1000 * 60 * 60);
  return parseFloat(deficit.toFixed(1));
}

/**
 * Process HRV trend data for the last 7 days
 * @param hrvData - Array of recovery data with HRV values
 * @returns Processed HRV trend data
 */
export function processHrvTrend(hrvData: RecoveryData[]): Array<{ date: string; value: number }> {
  // Get the last 7 days of data, or pad with null values if less than 7 days
  const last7Days = hrvData.slice(-7);
  
  // Format the data for display
  return last7Days.map(item => ({
    date: new Date(item.created_at || Date.now()).toISOString().split('T')[0],
    value: item.hrv_rmssd_milli
  }));
}

/**
 * Process all dashboard data
 * @param recoveryData - Recovery data
 * @param hrvData - HRV trend data
 * @param sleepData - Sleep data
 * @returns Processed dashboard data
 */
export function processDashboardData(
  recoveryData: RecoveryData,
  hrvData: RecoveryData[],
  sleepData: SleepData
): ProcessedDashboardData {
  return {
    recovery_score: recoveryData.recovery_score,
    recovery_status: getRecoveryStatus(recoveryData.recovery_score),
    recovery_color: getRecoveryColor(recoveryData.recovery_score),
    resting_heart_rate: recoveryData.resting_heart_rate,
    hrv_current: recoveryData.hrv_rmssd_milli,
    hrv_trend: processHrvTrend(hrvData),
    sleep_hours: formatSleepDuration(sleepData.score.stage_summary.total_sleep_time_milli),
    sleep_needed: formatSleepDuration(sleepData.score.stage_summary.sleep_needed_milli),
    sleep_deficit: getSleepDeficit(
      sleepData.score.stage_summary.total_sleep_time_milli,
      sleepData.score.stage_summary.sleep_needed_milli
    ),
    last_updated: new Date().toISOString()
  };
}
