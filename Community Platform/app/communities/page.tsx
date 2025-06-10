"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users } from "lucide-react"

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userCommunities, setUserCommunities] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load communities from local storage or use sample data
    const loadCommunities = () => {
      try {
        const storedCommunities = localStorage.getItem("communities")
        if (storedCommunities) {
          setCommunities(JSON.parse(storedCommunities))
        } else {
          // Sample data if no communities in local storage
          const sampleCommunities = [
            {
              id: "1",
              name: "General Health",
              description: " Support and information sharing.",
              members: 1250,
              posts: 324,
            },
            {
              id: "2",
              name: "Arthiritis Care",
              description: "Arthiritis Support and daily Care.",
              members: 3420,
              posts: 567,
            },
            {
              id: "3",
              name: "Diabetes Support",
              description: "Diabetes support and information sharing.",
              members: 890,
              posts: 213,
            },
            {
              id: "4",
              name: "Hypertension Awareness",
              description: "hypertension awareness and support group.",
              members: 1560,
              posts: 432,
            },
            {
              id: "5",
              name: "Heart Health",
              description: "A place for people to share their fitness journeys and tips.",
              members: 1560,
              posts: 432,
            },
            {
              id: "4",
              name: "Fitness Enthusiasts",
              description: "A community for fitness enthusiasts to share tips and motivation.",
              members: 1560,
              posts: 432,
            },
          ]
          setCommunities(sampleCommunities)
          localStorage.setItem("communities", JSON.stringify(sampleCommunities))
        }
      } catch (error) {
        console.error("Failed to load communities:", error)
      } finally {
        setLoading(false)
      }
    }

    // Check which communities the user has joined
    const loadUserCommunities = () => {
      try {
        const storedUserCommunities = localStorage.getItem("userCommunities")
        if (storedUserCommunities) {
          const userCommunitiesArray = JSON.parse(storedUserCommunities)
          const userCommunitiesMap: Record<string, boolean> = {}
          userCommunitiesArray.forEach((community: any) => {
            userCommunitiesMap[community.id] = true
          })
          setUserCommunities(userCommunitiesMap)
        }
      } catch (error) {
        console.error("Failed to load user communities:", error)
      }
    }

    loadCommunities()
    loadUserCommunities()
  }, [])

  const handleJoinCommunity = (communityId: string, communityName: string) => {
    try {
      // Toggle join status
      const isCurrentlyJoined = userCommunities[communityId]
      const newUserCommunities = { ...userCommunities }

      if (isCurrentlyJoined) {
        delete newUserCommunities[communityId]
      } else {
        newUserCommunities[communityId] = true
      }

      setUserCommunities(newUserCommunities)

      // Update user communities in local storage
      const storedUserCommunities = localStorage.getItem("userCommunities")
      let userCommunitiesArray = storedUserCommunities ? JSON.parse(storedUserCommunities) : []

      if (!isCurrentlyJoined) {
        // Add community to user communities if not already there
        if (!userCommunitiesArray.some((c: any) => c.id === communityId)) {
          userCommunitiesArray.push({
            id: communityId,
            name: communityName,
          })
        }
      } else {
        // Remove community from user communities
        userCommunitiesArray = userCommunitiesArray.filter((c: any) => c.id !== communityId)
      }

      localStorage.setItem("userCommunities", JSON.stringify(userCommunitiesArray))
    } catch (error) {
      console.error("Failed to update community membership:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-slate-200 rounded"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 bg-slate-200 rounded-lg"></div>
            <div className="h-48 bg-slate-200 rounded-lg"></div>
            <div className="h-48 bg-slate-200 rounded-lg"></div>
            <div className="h-48 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Communities
        </h1>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
        >
          <Link href="/create-community">Create Community</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {communities.map((community) => (
          <Card key={community.id} className="post-card overflow-hidden border border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">r/{community.name}</CardTitle>
              <CardDescription>{community.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-500">
                <Users className="mr-2 h-4 w-4" />
                <span>
                  {community.members.toLocaleString()} members • {community.posts} posts
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild className="border-slate-200 hover:bg-blue-50 hover:text-blue-600">
                <Link href={`/communities/${community.id}`}>View</Link>
              </Button>
              <Button
                className={
                  userCommunities[community.id]
                    ? "bg-slate-100 text-blue-600 hover:bg-slate-200"
                    : "bg-blue-500 hover:bg-blue-600"
                }
                variant={userCommunities[community.id] ? "outline" : "default"}
                onClick={() => handleJoinCommunity(community.id, community.name)}
              >
                {userCommunities[community.id] ? "Leave" : "Join"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
