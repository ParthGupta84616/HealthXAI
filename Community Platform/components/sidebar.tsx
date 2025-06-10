"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, ChevronLeft, Home, Menu, PlusCircle, Search, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const routes = [

  {
    name: "Communities",
    path: "/communities",
    icon: Users,
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    name: "Create Community",
    path: "/create-community",
    icon: PlusCircle,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()
  const [userCommunities, setUserCommunities] = useState<any[]>([])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        // Auto close sidebar on mobile
        if (isOpen) toggle()
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    // Load user communities from local storage
    const loadUserCommunities = () => {
      try {
        const storedCommunities = localStorage.getItem("userCommunities")
        if (storedCommunities) {
          setUserCommunities(JSON.parse(storedCommunities))
        }
      } catch (error) {
        console.error("Failed to load user communities:", error)
      }
    }

    loadUserCommunities()

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [isOpen, toggle])

  return (
    <>
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button variant="outline" size="icon" onClick={toggle} className="bg-white shadow-md">
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Community
            </span>
          </Link>
          {!isMobile && (
            <Button variant="ghost" size="icon" onClick={toggle} className="hover:bg-slate-100">
              <ChevronLeft className={cn("h-4 w-4 transition-transform", !isOpen && "rotate-180")} />
            </Button>
          )}
        </div>

        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search communities..."
              className="w-full rounded-md border border-slate-200 bg-white px-9 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  toast({
                    title: "Search",
                    description: "Search functionality will be implemented soon!",
                  })
                }
              }}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="px-2 py-2">
            <nav className="flex flex-col space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === route.path
                      ? "bg-blue-500 text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  <span>{route.name}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 px-3">
              <h3 className="mb-2 text-xs font-semibold text-slate-500">Your Communities</h3>
              <div id="user-communities" className="space-y-1">
                {userCommunities && userCommunities.length > 0 ? (
                  userCommunities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.id}`}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{community.name.charAt(0)}</span>
                      </div>
                      <span>r/{community.name}</span>
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 py-2">Join or create communities to see them here</div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Add logout button */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-200">
          <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
            onClick={async () => {
              try {
                const response = await fetch('/api/users/logout', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (response.ok) {
                  window.location.reload();
                } else {
                  toast({
                    title: "Logout failed",
                    description: "Something went wrong. Please try again.",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error("Logout error:", error);
                toast({
                  title: "Logout failed",
                  description: "Something went wrong. Please try again.",
                  variant: "destructive",
                });
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}