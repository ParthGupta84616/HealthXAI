"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, MessageSquare, ThumbsUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Initialize with demo notifications and add more at random intervals
  useEffect(() => {
    // Sample initial notifications
    const initialNotifications = [
      {
        id: `notification_${Date.now()}_1`,
        type: "like",
        content: "DrCardiology liked your post in r/HeartHealth",
        time: "Just now",
        read: false,
      },
      {
        id: `notification_${Date.now()}_2`,
        type: "comment",
        content: "MedStudent commented on your post: 'This treatment approach is fascinating!'",
        time: "5 minutes ago",
        read: false,
      },
      {
        id: `notification_${Date.now()}_3`,
        type: "join",
        content: "NursePractitioner joined your community r/PatientCare",
        time: "20 minutes ago",
        read: true,
      },
    ];

    setNotifications(initialNotifications)
    setLoading(false)

    // Function to generate random notifications
    const generateRandomNotification = () => {
      const types = ["like", "comment", "join", "post", "share"]
      const type = types[Math.floor(Math.random() * types.length)]

      const users = ["DrSmith", "NursePatel", "MedStudent", "PharmacistJones", "Radiologist42", "SurgeonDaily", "TherapistCare"]
      const user = users[Math.floor(Math.random() * users.length)]

      const communities = ["DiabetesCare", "HeartHealth", "MentalWellness", "MedicalEthics", "EmergencyCare", "Pediatrics", "CancerResearch"]
      const community = communities[Math.floor(Math.random() * communities.length)]

      let content = ""
      switch (type) {
        case "like":
          content = `${user} liked your post in r/${community}`
          break
        case "comment":
          const comments = [
            "I've seen similar symptoms in my patients.",
            "What dosage would you recommend for this condition?",
            "This research could change treatment protocols!",
            "Have you considered alternative therapies?",
            "The patient outcomes in your study are remarkable.",
          ]
          const comment = comments[Math.floor(Math.random() * comments.length)]
          content = `${user} commented on your post: '${comment}'`
          break
        case "join":
          content = `${user} joined your community r/${community}`
          break
        case "share":
          content = `${user} shared your post from r/${community}`
          break
        case "post":
          const postTitles = [
            "New treatment approach for chronic conditions",
            "Study results: Effectiveness of vaccine X",
            "Managing side effects of common medications",
            "Patient case study: Unusual presentation of disease Y",
            "Wellness strategies for healthcare professionals",
          ]
          const title = postTitles[Math.floor(Math.random() * postTitles.length)]
          content = `New post in r/${community}: "${title}"`
          break
        default:
          content = `${user} interacted with your content`
      }

      return {
        id: `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        content,
        time: "Just now",
        read: false,
      }
    }

    // Generate a random interval between 10-20 seconds (in milliseconds)
    const getRandomInterval = () => {
      return Math.floor(Math.random() * 11 + 10) * 1000; // Random between 10-20 seconds
    }
    
    // Function to add a new notification with random timing
    const addNotificationWithRandomTiming = () => {
      const newNotification = generateRandomNotification();
      
      // Add new notification to the beginning of the array
      setNotifications((prev) => [newNotification, ...prev]);
      
      // Show toast for the new notification
      toast({
        title: "New Notification",
        description: newNotification.content,
      });
      
      // Set next notification with a new random interval
      const nextInterval = getRandomInterval();
      setTimeout(addNotificationWithRandomTiming, nextInterval);
    }
    
    // Start the first random interval
    const initialTimeout = setTimeout(addNotificationWithRandomTiming, getRandomInterval());
    
    // Clean up timeout on unmount
    return () => clearTimeout(initialTimeout);
  }, [toast])

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }))

    setNotifications(updatedNotifications)

    toast({
      title: "All notifications marked as read",
      description: "You have no unread notifications",
    })
  }

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    )

    setNotifications(updatedNotifications)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-4 w-4 text-blue-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "join":
      case "share":
        return <Users className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-slate-500" />
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl flex justify-center items-center min-h-[60vh]">
        <p className="text-slate-600">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-slate-600 mt-1">
              You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
        >
          Mark all as read
        </Button>
      </div>

      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription className="text-blue-100">
            {/* Demo mode: New notifications added every 10 seconds */}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item flex items-start p-4 ${notification.read ? "bg-white" : "bg-blue-50"} cursor-pointer`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className={`mr-3 mt-0.5 rounded-full p-2 ${notification.read ? "bg-slate-100" : "bg-blue-100"}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${notification.read ? "text-slate-600" : "font-medium text-slate-800"}`}>
                      {notification.content}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 notification-dot"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <Bell className="mx-auto h-12 w-12 mb-4 text-slate-300" />
              <p className="text-slate-600 mb-2">No notifications yet</p>
              <p className="text-sm text-slate-500">When you receive notifications, they'll appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
