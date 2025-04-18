import React from 'react';
import Link from 'next/link';

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Authentication Successful!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your WHOOP account has been successfully connected to your TRMNL device.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Connection established</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your TRMNL device will now display your WHOOP recovery data. The dashboard will automatically refresh every 4 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-center">
            <p className="text-gray-600">
              You can now close this window and return to your TRMNL device.
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Having issues? <a href="https://usetrmnl.com/support" className="font-medium text-indigo-600 hover:text-indigo-500">Contact support</a>
        </p>
      </div>
    </div>
  );
}
