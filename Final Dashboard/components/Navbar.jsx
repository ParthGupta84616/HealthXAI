"use client"; // Required for usePathname hook

import React from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname

// Define titles for your Next.js routes
const pageTitles = {
  '/': 'Dashboard', // Example: Assuming '/' is the dashboard
  '/consultant': 'Consultant',
  '/profile': 'Profile', // Example route
  '/settings': 'Settings', // Example route
  '/diagnosis': 'Diagnosis', // Added diagnosis route
  // Add other routes as needed
};

const Navbar = () => {
  const pathname = usePathname(); // Get the current path
  // Determine the title, default to a generic name if no match
  const currentPage = pageTitles[pathname] || 'Health Agent';

  return (
    // Removed bg-white and shadow classes, kept sticky positioning
    <nav className="sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Show dynamic title */}
          <div className="flex-shrink-0 flex items-center">
            {/* Adjusted text color for potentially darker backgrounds */}
            <span className="text-xl font-semibold text-slate-800">{currentPage}</span>
            {/* Optional: Keep original logo/brand if needed */}
            {/* <span className="ml-4 text-xl font-semibold text-slate-800">HealthAgent</span> */}
          </div>

          {/* Navigation Links (Optional: You might hide these if the title serves as primary context) */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {/* Example link structure - update hrefs to match your routes */}
            <a
              href="/" // Example route
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === '/'
                ? 'border-indigo-500 text-slate-900' // Active link style
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700' // Inactive link style
              }`}
            >
              Dashboard
            </a>
            <a
              href="/consultant"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === '/consultant'
                ? 'border-indigo-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Consultant
            </a>
             <a
              href="/diagnosis" // Added diagnosis link
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === '/diagnosis'
                ? 'border-indigo-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Diagnosis
            </a>
            {/* Add other links similarly */}
          </div>

          {/* Right side items (e.g., User profile/button) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* ... (Notification Bell and Profile Dropdown remain the same) ... */}
            {/* Adjusted icon color for potentially darker backgrounds */}
            <button
              type="button"
              className="p-1 rounded-full text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  // Removed bg-white, rely on SVG background or parent
                  className="rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  {/* Adjusted placeholder color */}
                  <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-slate-200">
                    <svg className="h-full w-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                </button>
              </div>
              {/* Dropdown menu (hidden by default) */}
              {/* ... (Dropdown structure remains the same) ... */}
            </div>
          </div>

          {/* Mobile menu button (placeholder) */}
          {/* ... (Mobile menu button remains the same) ... */}
          <div className="-mr-2 flex items-center sm:hidden">
             {/* Adjusted icon color */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. (placeholder) */}
      {/* ... (Mobile menu structure remains the same) ... */}
    </nav>
  );
};

export default Navbar;