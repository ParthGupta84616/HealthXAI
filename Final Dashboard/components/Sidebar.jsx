"use client"; // Required for usePathname hook

import React from 'react'; 
import Link from 'next/link'; // Use Next.js Link for navigation
import { usePathname } from 'next/navigation'; // Hook to get current path
import { 
  LayoutDashboard, // For Dashboard
  MessageSquareHeart, // For Consultant
  User,             // For Profile
  Activity,         // For Activity/Fitness
  Apple,            // For Nutrition/Diet
  Settings,         // For Settings
  ChevronLeft, 
  ChevronRight,
  LogOut            
} from 'lucide-react';

// Accept isCollapsed and setIsCollapsed as props
const Sidebar = ({ isCollapsed, setIsCollapsed }) => { 
  const pathname = usePathname(); // Get current path for active link styling

  // Updated navigation items relevant to the Health Agent application
  const navItems = [
    { href: '/', icon: LayoutDashboard, label: "Dashboard" }, 
    { href: '/consultant', icon: MessageSquareHeart, label: "Consultant" }, 
    { href: '/profile', icon: User, label: "Profile" }, // Added Profile
    { href: '/activity', icon: Activity, label: "Activity" }, // Added Activity
    { href: '/nutrition', icon: Apple, label: "Nutrition" }, // Added Nutrition
    { href: '/settings', icon: Settings, label: "Settings" }, 
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/users/logout', { method: 'GET' });
      if (response.ok) {
        window.location.reload(); // Refresh the page after successful logout
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    // Keep fixed positioning below navbar
    <aside 
      className={`
        fixed top-16 left-0 z-30 bg-white shadow-lg shadow-slate-200 
        flex flex-col justify-between /* Added justify-between */
        transition-all duration-300 ease-in-out
        h-[calc(100vh-4rem)] /* Full height below navbar */
        ${isCollapsed ? 'w-20' : 'w-64'} 
      `}
    >
      {/* Top section: Logo/Toggle and Navigation */}
      <div>
        {/* Sidebar Header/Logo Area */}
        <div className="flex items-center justify-center h-16 flex-shrink-0 border-b border-slate-200 relative">
          {/* Toggle Button - Kept existing style/position */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`
              absolute -right-3 top-1/2 -translate-y-1/2 z-50 
              bg-white border border-slate-200 rounded-full p-1 
              text-slate-500 hover:bg-slate-100 focus:outline-none 
              focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
              transition-opacity duration-300
              opacity-100 
            `}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          {/* Conditional Brand Name/Icon */}
          {!isCollapsed && (
            <span className="text-xl font-semibold text-slate-800">HealthAgent</span>
          )}
          {isCollapsed && (
            // Use a relevant icon for collapsed state if desired
            <MessageSquareHeart className="h-6 w-6 text-indigo-600" /> // Changed icon
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4"> 
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href; // Check if the link is active
              return (
                <li key={item.href}>
                  <Link // Use Next.js Link
                    href={item.href}
                    className={`
                      group flex items-center rounded-md text-sm font-medium
                      transition-colors duration-150 ease-in-out
                      ${isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-3 py-2 h-10'} 
                      ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600' // Active state (light theme)
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' // Default state (light theme)
                      }
                    `}
                    title={isCollapsed ? item.label : undefined} 
                  >
                    <item.icon
                      className={`
                        flex-shrink-0 h-5 w-5 
                        ${isCollapsed ? '' : 'mr-3'} 
                        ${
                          isActive
                            ? 'text-indigo-500' // Active icon color
                            : 'text-slate-400 group-hover:text-slate-500' // Default icon color
                        }
                      `}
                      aria-hidden="true"
                    />
                    {/* Hide text when collapsed */}
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom section: Logout */}
      <div className="px-2 pb-4">
         {/* Logout Button */}
         <button 
            onClick={handleLogout} 
            className={`
              group flex items-center rounded-md text-sm font-medium
              transition-colors duration-150 ease-in-out
              ${isCollapsed ? 'justify-center h-12 w-12 mx-auto' : 'px-3 py-2 h-10'} 
              text-slate-600 hover:bg-slate-50 hover:text-slate-900 
            `}
            title={isCollapsed ? "Logout" : undefined} 
          >
            <LogOut
              className={`
                flex-shrink-0 h-5 w-5 
                ${isCollapsed ? '' : 'mr-3'} 
                text-slate-400 group-hover:text-slate-500 
              `}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <span className="whitespace-nowrap">Logout</span>
            )}
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;