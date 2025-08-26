import { ProcessedDashboardData } from './whoop/utils';

/**
 * Generate HTML for the WHOOP Recovery Dashboard
 * @param data - The processed dashboard data
 * @returns HTML string
 */
export function generateDashboardHtml(data: ProcessedDashboardData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WHOOP Recovery Dashboard</title>
  <style>
    /* Inline styles for TRMNL e-ink display */
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      width: 800px;
      height: 480px;
      overflow: hidden;
      background-color: white;
      color: black;
    }

    .layout {
      display: grid;
      grid-template-rows: auto 40px;
      height: 100%;
    }

    .layout--full {
      width: 100%;
    }

    .panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      padding: 20px;
      gap: 20px;
    }

    .panel__section {
      border: 1px solid #000;
      padding: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .recovery-score {
      font-size: 64px;
      font-weight: bold;
      margin: 0;
      line-height: 1;
    }

    .recovery-status {
      font-size: 18px;
      margin: 10px 0 0;
      text-align: center;
    }

    .heart-rate {
      font-size: 48px;
      font-weight: bold;
      margin: 0;
      line-height: 1;
    }

    .hrv-trend {
      width: 100%;
      height: 120px;
      position: relative;
    }

    .hrv-trend-line {
      stroke: black;
      stroke-width: 2;
      fill: none;
    }

    .hrv-trend-point {
      fill: black;
    }

    .hrv-trend-baseline {
      stroke: black;
      stroke-width: 1;
      stroke-dasharray: 4 4;
    }

    .sleep-progress {
      width: 100%;
      height: 20px;
      border: 1px solid #000;
      margin: 10px 0;
      position: relative;
    }

    .sleep-progress-bar {
      height: 100%;
      background-color: #000;
    }

    .title_bar {
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-top: 1px solid #000;
      height: 40px;
    }

    .title_bar .image {
      height: 24px;
      margin-right: 10px;
    }

    .title_bar .title {
      font-weight: bold;
      margin-right: 10px;
    }

    .title_bar .instance {
      font-size: 14px;
      color: #666;
    }

    .last-updated {
      position: absolute;
      bottom: 5px;
      right: 10px;
      font-size: 10px;
      color: #666;
    }

    /* Pattern styles for e-ink display */
    .pattern-green {
      background: repeating-linear-gradient(45deg, #000, #000 2px, #fff 2px, #fff 4px);
    }

    .pattern-yellow {
      background: repeating-linear-gradient(90deg, #000, #000 1px, #fff 1px, #fff 3px);
    }

    .pattern-red {
      background: repeating-linear-gradient(0deg, #000, #000 1px, #fff 1px, #fff 3px);
    }
  </style>
</head>
<body>
  <div class="layout layout--full">
    <div class="panel">
      <!-- Recovery Score Section -->
      <div class="panel__section">
        <h3>Recovery Score</h3>
        <h2 class="recovery-score">${data.recovery_score}%</h2>
        <p class="recovery-status">${data.recovery_status}</p>
        <div class="recovery-indicator pattern-${data.recovery_color}" style="width: 40px; height: 10px; margin-top: 10px;"></div>
        <span class="last-updated">Updated: ${new Date(data.last_updated).toLocaleString()}</span>
      </div>
      
      <!-- HRV Trend Graph Section -->
      <div class="panel__section">
        <h3>HRV Trend (7 Days)</h3>
        <svg class="hrv-trend" viewBox="0 0 300 150" preserveAspectRatio="none">
          <!-- Baseline -->
          <line class="hrv-trend-baseline" x1="0" y1="75" x2="300" y2="75"></line>
          
          <!-- HRV Trend Line -->
          ${generateHrvTrendSvg(data.hrv_trend)}
        </svg>
        <p style="text-align: center; margin: 5px 0;">Current: ${Math.round(data.hrv_current)} ms</p>
      </div>
      
      <!-- Resting Heart Rate Section -->
      <div class="panel__section">
        <h3>Resting Heart Rate</h3>
        <p class="heart-rate">${data.resting_heart_rate}</p>
        <p>BPM</p>
      </div>
      
      <!-- Sleep Performance Section -->
      <div class="panel__section">
        <h3>Sleep Performance</h3>
        <p>${data.sleep_hours} of ${data.sleep_needed}</p>
        
        ${generateSleepProgressBar(data.sleep_hours, data.sleep_needed)}
        
        <p>
          ${data.sleep_deficit < 0 
            ? `Sleep Deficit: ${Math.abs(data.sleep_deficit)} hours` 
            : `Sleep Surplus: ${data.sleep_deficit} hours`}
        </p>
      </div>
    </div>
    
    <div class="title_bar">
      <img class="image" src="https://usetrmnl.com/images/plugins/whoop-icon.svg" alt="WHOOP Logo" />
      <span class="title">WHOOP Recovery</span>
      <span class="instance">Daily Status</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate SVG for HRV trend
 * @param hrvTrend - Array of HRV data points
 * @returns SVG elements as string
 */
function generateHrvTrendSvg(hrvTrend: Array<{ date: string; value: number }>): string {
  // Find min and max values for scaling
  let minHrv = 1000;
  let maxHrv = 0;
  
  hrvTrend.forEach(item => {
    if (item.value > maxHrv) maxHrv = item.value;
    if (item.value < minHrv) minHrv = item.value;
  });
  
  // Ensure we have a range (prevent division by zero)
  const range = maxHrv - minHrv || 10;
  
  // Generate points for the path
  let points = '';
  let circles = '';
  let dayLabels = '';
  
  // Generate day labels
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  for (let i = 0; i < 7; i++) {
    const x = i * 42.85 + 10;
    const dayIndex = i % 7;
    dayLabels += `<text x="${x}" y="145" font-size="10" text-anchor="middle">${days[dayIndex]}</text>`;
  }
  
  // Generate path and circles
  hrvTrend.forEach((item, index) => {
    const x = index * 42.85 + 10;
    const normalized = (item.value - minHrv) / range;
    const y = 140 - normalized * 120 + 10;
    
    if (index === 0) {
      points = `M${x},${y}`;
    } else {
      points += ` L${x},${y}`;
    }
    
    circles += `<circle class="hrv-trend-point" cx="${x}" cy="${y}" r="3"></circle>`;
  });
  
  return `
    ${dayLabels}
    <path class="hrv-trend-line" d="${points}"></path>
    ${circles}
  `;
}

/**
 * Generate HTML for sleep progress bar
 * @param sleepHours - Formatted sleep hours string (e.g., "7h 30m")
 * @param sleepNeeded - Formatted sleep needed string (e.g., "8h 0m")
 * @returns HTML for sleep progress bar
 */
function generateSleepProgressBar(sleepHours: string, sleepNeeded: string): string {
  // Parse hours and minutes from strings
  const sleepHoursMatch = sleepHours.match(/(\d+)h\s+(\d+)m/);
  const sleepNeededMatch = sleepNeeded.match(/(\d+)h\s+(\d+)m/);
  
  if (!sleepHoursMatch || !sleepNeededMatch) {
    return '<div class="sleep-progress"><div class="sleep-progress-bar" style="width: 0%;"></div></div>';
  }
  
  const actualHours = parseInt(sleepHoursMatch[1]);
  const actualMinutes = parseInt(sleepHoursMatch[2]);
  const neededHours = parseInt(sleepNeededMatch[1]);
  const neededMinutes = parseInt(sleepNeededMatch[2]);
  
  const actualMinutesTotal = actualHours * 60 + actualMinutes;
  const neededMinutesTotal = neededHours * 60 + neededMinutes;
  
  // Calculate percentage (cap at 100%)
  let percent = (actualMinutesTotal / neededMinutesTotal) * 100;
  if (percent > 100) percent = 100;
  
  return `<div class="sleep-progress">
    <div class="sleep-progress-bar" style="width: ${percent}%;"></div>
  </div>`;
}

/**
 * Generate HTML for the authentication page
 * @param authUrl - The URL for WHOOP authorization
 * @returns HTML string
 */
export function generateAuthHtml(authUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WHOOP Authentication</title>
  <style>
    /* Inline styles for TRMNL e-ink display */
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      width: 800px;
      height: 480px;
      overflow: hidden;
      background-color: white;
      color: black;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 20px;
    }

    p {
      font-size: 18px;
      line-height: 1.5;
      margin-bottom: 30px;
      max-width: 600px;
    }

    .qr-placeholder {
      width: 200px;
      height: 200px;
      border: 1px solid #000;
      margin: 20px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .auth-link {
      display: block;
      margin-top: 20px;
      font-size: 16px;
      word-break: break-all;
      max-width: 600px;
    }

    .title_bar {
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-top: 1px solid #000;
      height: 40px;
    }

    .title_bar .image {
      height: 24px;
      margin-right: 10px;
    }

    .title_bar .title {
      font-weight: bold;
      margin-right: 10px;
    }

    .title_bar .instance {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>WHOOP Authentication Required</h1>
    
    <p>To display your WHOOP recovery data, this dashboard needs to connect to your WHOOP account. Please scan the QR code below or visit the URL on your phone or computer to authorize access.</p>
    
    <div class="qr-placeholder">
      Visit: ${authUrl}
    </div>
    
    <p>Once authorized, your WHOOP recovery data will automatically appear on this display.</p>
    
    <div class="auth-link">
      ${authUrl}
    </div>
  </div>
  
  <div class="title_bar">
    <img class="image" src="https://usetrmnl.com/images/plugins/whoop-icon.svg" alt="WHOOP Logo" />
    <span class="title">WHOOP Recovery</span>
    <span class="instance">Authentication</span>
  </div>
</body>
</html>`;
}

/**
 * Generate HTML for the error page
 * @param message - The error message
 * @param error - Optional error details
 * @returns HTML string
 */
export function generateErrorHtml(message: string, error?: unknown): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - WHOOP Recovery Dashboard</title>
  <style>
    /* Inline styles for TRMNL e-ink display */
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      width: 800px;
      height: 480px;
      overflow: hidden;
      background-color: white;
      color: black;
      display: flex;
      flex-direction: column;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 20px;
    }

    .error-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .error-message {
      font-size: 20px;
      margin-bottom: 30px;
      max-width: 600px;
    }

    .error-details {
      font-size: 16px;
      margin-top: 20px;
      text-align: left;
      max-width: 600px;
      border: 1px solid #000;
      padding: 15px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .retry-info {
      margin-top: 30px;
      font-size: 18px;
    }

    .title_bar {
      display: flex;
      align-items: center;
      padding: 0 20px;
      border-top: 1px solid #000;
      height: 40px;
    }

    .title_bar .image {
      height: 24px;
      margin-right: 10px;
    }

    .title_bar .title {
      font-weight: bold;
      margin-right: 10px;
    }

    .title_bar .instance {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="content">
    <div class="error-icon">!</div>
    <h1>Error</h1>
    
    <div class="error-message">
      ${message}
    </div>
    
    ${error ? `
    <div class="error-details">
      ${error instanceof Error ? error.message : JSON.stringify(error)}
    </div>
    ` : ''}
    
    <div class="retry-info">
      The dashboard will automatically retry in a few minutes.
      <br>
      Last attempt: ${new Date().toLocaleString()}
    </div>
  </div>
  
  <div class="title_bar">
    <img class="image" src="https://usetrmnl.com/images/plugins/whoop-icon.svg" alt="WHOOP Logo" />
    <span class="title">WHOOP Recovery</span>
    <span class="instance">Error</span>
  </div>
</body>
</html>`;
}
