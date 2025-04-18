# WHOOP Recovery Dashboard for TRMNL

A private plugin for the TRMNL e-ink display that provides users with at-a-glance visibility into their key WHOOP health metrics. The dashboard focuses on essential recovery metrics including daily recovery score, heart rate variability (HRV) trends, resting heart rate, and sleep performance - delivering this information in a simple, easy-to-read format optimized for low-refresh e-ink displays.

## Features

- Daily recovery score display with status indicator
- 7-day HRV trend graph
- Resting heart rate display with comparison to baseline
- Sleep performance metrics with comparison to sleep need
- Automatic refresh when new WHOOP data is available
- OAuth authentication with WHOOP API

## Technical Details

- **Framework**: Next.js with TypeScript
- **Deployment**: Vercel
- **Data Storage**: Vercel KV (for token storage)
- **API Integration**: WHOOP API via OAuth 2.0
- **Display**: Optimized for TRMNL's 7.5" E-Ink display (800x480 pixels, 1-bit monochrome)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Vercel Account](https://vercel.com/)
- [WHOOP Developer Account](https://developer.whoop.com/)
- [TRMNL Device](https://usetrmnl.com/)

### Local Development

1. Clone this repository:
   ```bash
   git clone https://github.com/sapochat/whoop-trmnl-plugin.git
   cd whoop-trmnl-plugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your credentials:
   ```
   # WHOOP API Credentials
   WHOOP_CLIENT_ID=your_client_id_here
   WHOOP_CLIENT_SECRET=your_client_secret_here

   # Next.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # Vercel KV (for local development, you can use mock values)
   KV_URL=your_kv_url_here
   KV_REST_API_URL=your_kv_rest_api_url_here
   KV_REST_API_TOKEN=your_kv_rest_api_token_here
   KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token_here

   # TRMNL Configuration
   NEXT_PUBLIC_TRMNL_PLUGIN_URL=http://localhost:3000/api/dashboard
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Deployment

1. Create a new project on Vercel and link it to your GitHub repository.

2. Set up the following environment variables in your Vercel project:
   - `WHOOP_CLIENT_ID`
   - `WHOOP_CLIENT_SECRET`
   - `NEXTAUTH_URL` (your Vercel deployment URL)
   - `NEXTAUTH_SECRET` (generate a random string)
   - `NEXT_PUBLIC_TRMNL_PLUGIN_URL` (your Vercel deployment URL + `/api/dashboard`)

3. Set up Vercel KV for token storage:
   ```bash
   vercel link
   vercel env pull .env.local
   npm run dev
   ```

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## TRMNL Configuration

1. Visit your deployed application and click "Connect WHOOP" to authorize access to your WHOOP data.

2. On your TRMNL device, add a new plugin with the following URL:
   ```
   https://your-vercel-app.vercel.app/api/dashboard
   ```

3. Set the refresh interval to 14400 seconds (4 hours) or your preferred interval.

## Project Structure

```
whoop-trmnl-plugin/
├── public/               # Static assets
├── src/                  # Source code
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # Authentication routes
│   │   │   └── dashboard/# Dashboard API endpoint
│   │   ├── auth/         # Auth pages
│   │   └── page.tsx      # Home page
│   └── lib/              # Library code
│       ├── kv.ts         # Vercel KV utilities
│       ├── template.ts   # HTML template generation
│       └── whoop/        # WHOOP API integration
│           ├── api.ts    # WHOOP API client
│           └── utils.ts  # Data processing utilities
├── .env.local.example    # Example environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## License

[MIT](LICENSE)
