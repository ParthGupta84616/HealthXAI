"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, Grid, Zap, Music, Settings, LogOut, ExternalLink } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "New", href: "http://localhost:5173/", icon: ExternalLink },
    // { name: "Camera", href: "/camera", icon: Camera },
    // { name: "Rooms", href: "/rooms", icon: Grid },
    // { name: "Devices", href: "/devices", icon: Zap },
    // { name: "Music", href: "/music", icon: Music },
    // { name: "Settings", href: "/settings", icon: Settings },
  ]

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
    <aside className="w-16 md:w-20 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-6">
      <div className="w-10 h-10 rounded-full bg-black mb-8 flex items-center justify-center text-white font-bold">
        SH
      </div>
      <nav className="flex flex-col items-center space-y-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`p-2 rounded-xl transition-colors ${isActive ? "bg-[#E7E6E9] text-[#091425]" : "text-[#091425] hover:bg-gray-100"
                }`}
              title={item.name}
            >
              <item.icon className="w-6 h-6" />
              <span className="sr-only">{item.name}</span>
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="mt-auto p-2 rounded-xl text-[#091425] hover:bg-gray-100 transition-colors"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
          <span className="sr-only">Logout</span>
        </button>
      </nav>

    </aside>
  )
}
