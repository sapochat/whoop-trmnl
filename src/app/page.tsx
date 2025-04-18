import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">WHOOP Recovery Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link href="/api/auth" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Connect WHOOP
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Hero section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Track Your WHOOP Recovery on TRMNL</h2>
                    <p className="text-gray-600 mb-6">
                      The WHOOP Recovery Dashboard for TRMNL provides at-a-glance visibility into your key WHOOP health metrics on your TRMNL e-ink display.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">Daily Recovery Score</h3>
                          <p className="mt-1 text-sm text-gray-600">See your daily recovery score and status at a glance.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">HRV Trend</h3>
                          <p className="mt-1 text-sm text-gray-600">Track your heart rate variability over the past 7 days.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">Resting Heart Rate</h3>
                          <p className="mt-1 text-sm text-gray-600">Monitor your resting heart rate and compare to your baseline.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">Sleep Performance</h3>
                          <p className="mt-1 text-sm text-gray-600">See how your sleep compares to your sleep need.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="bg-gray-200 rounded-lg p-4 w-full max-w-md aspect-[5/3] flex items-center justify-center">
                      <p className="text-gray-500 text-center">TRMNL Dashboard Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Setup instructions */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup Instructions</h2>
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        1
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Connect Your WHOOP Account</h3>
                      <p className="mt-1 text-gray-600">
                        Click the &quot;Connect WHOOP&quot; button above to authorize access to your WHOOP data.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        2
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Configure Your TRMNL Device</h3>
                      <p className="mt-1 text-gray-600">
                        Add a new plugin to your TRMNL device with the following URL:
                      </p>
                      <div className="mt-2 bg-gray-50 p-3 rounded-md">
                        <code className="text-sm text-gray-800">{process.env.NEXT_PUBLIC_TRMNL_PLUGIN_URL || 'https://your-vercel-app.vercel.app/api/dashboard'}</code>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        3
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Enjoy Your Dashboard</h3>
                      <p className="mt-1 text-gray-600">
                        Your TRMNL device will now display your WHOOP recovery data. The dashboard will automatically refresh every 4 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="https://usetrmnl.com" className="text-gray-400 hover:text-gray-500">
                TRMNL Website
              </a>
              <a href="https://whoop.com" className="text-gray-400 hover:text-gray-500">
                WHOOP Website
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-gray-500">
                GitHub
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2025 WHOOP Recovery Dashboard for TRMNL. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
