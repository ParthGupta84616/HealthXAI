"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowUpRight, MessageSquare, ThumbsUp, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function CommunityPage({ params }: { params: { id: string } }) {
  const [isJoined, setIsJoined] = useState(false)
  const [community, setCommunity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    // Load community from local storage
    const loadCommunity = async () => {
      try {
        // Load communities
        const storedCommunities = localStorage.getItem("communities")
        let communityData = null

        if (storedCommunities) {
          const communities = JSON.parse(storedCommunities)
          communityData = communities.find((c: any) => c.id === params.id)
        }

        // If community not found, create a sample one
        if (!communityData) {
          communityData = {
            id: params.id,
            name: getCommunityName(params.id),
            description: "A community for sharing and discussing all things related to this topic.",
            members: 1250,
            rules: [
              "Be respectful to others",
              "No spam or self-promotion",
              "Stay on topic",
              "Follow Reddit's content policy",
            ],
          }
        }

        // Load posts for this community
        const storedPosts = localStorage.getItem("posts")
        let communityPosts = []

        if (storedPosts) {
          const allPosts = JSON.parse(storedPosts)
          communityPosts = allPosts.filter(
            (post: any) =>
              post.communityId === params.id || post.community?.toLowerCase() === communityData.name.toLowerCase(),
          )
        }

        // If no posts found, create sample posts
        if (communityPosts.length === 0) {
          communityPosts = [
            {
              id: `sample_${Date.now()}_1`,
              title: "Welcome to our community!",
              content: "This is the first post in our community. Feel free to introduce yourself!",
              author: "admin",
              votes: 42,
              comments: 7,
              createdAt: "2 days ago",
              thumbnail: "https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              communityId: params.id,
              community: communityData.name,
            },
            {
              id: `sample_${Date.now()}_2`,
              title: "Community rules and guidelines",
              content: "Please read and follow these rules to keep our community friendly and helpful.",
              author: "moderator",
              votes: 35,
              comments: 12,
              createdAt: "1 day ago",
              thumbnail: "/placeholder.svg?height=200&width=400",
              communityId: params.id,
              community: communityData.name,
            },
          ]

          // Add sample posts to all posts
          const allPosts = storedPosts ? JSON.parse(storedPosts) : []
          localStorage.setItem("posts", JSON.stringify([...allPosts, ...communityPosts]))
        }

        setCommunity({
          ...communityData,
          posts: communityPosts,
        })

        // Check if user has joined this community
        const userCommunities = localStorage.getItem("userCommunities")
        if (userCommunities) {
          const communities = JSON.parse(userCommunities)
          setIsJoined(communities.some((c: any) => c.id === params.id))
        }

        // Load liked posts
        const storedLikedPosts = localStorage.getItem("likedPosts")
        if (storedLikedPosts) {
          setLikedPosts(JSON.parse(storedLikedPosts))
        }
      } catch (error) {
        console.error("Failed to load community data:", error)
        toast({
          title: "Error",
          description: "Failed to load community data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCommunity()
  }, [params.id, toast])

  const getCommunityName = (id: string) => {
    // This is a simple mapping for the sample data
    const communities: Record<string, string> = {
      "1": "Mental Health",
      "2": "Chronic Illness Support",
      "3": "Nutrition & Wellness",
      "4": "Women's Health",
    }
    return communities[id] || id
  }

  const handleJoinCommunity = () => {
    try {
      // Toggle join status
      const newJoinedStatus = !isJoined
      setIsJoined(newJoinedStatus)

      // Update user communities in local storage
      const storedUserCommunities = localStorage.getItem("userCommunities")
      let userCommunities = storedUserCommunities ? JSON.parse(storedUserCommunities) : []

      if (newJoinedStatus) {
        // Add community to user communities if not already there
        if (!userCommunities.some((c: any) => c.id === community.id)) {
          userCommunities.push({
            id: community.id,
            name: community.name,
          })
        }
      } else {
        // Remove community from user communities
        userCommunities = userCommunities.filter((c: any) => c.id !== community.id)
      }

      localStorage.setItem("userCommunities", JSON.stringify(userCommunities))

      toast({
        title: newJoinedStatus ? "Joined community" : "Left community",
        description: newJoinedStatus ? `You have joined r/${community?.name}` : `You have left r/${community?.name}`,
      })
    } catch (error) {
      console.error("Failed to update community membership:", error)
      toast({
        title: "Error",
        description: "Failed to update community membership",
        variant: "destructive",
      })
    }
  }

  const handleLike = (postId: string) => {
    // Toggle like status
    const newLikedPosts = { ...likedPosts }
    const isCurrentlyLiked = newLikedPosts[postId]

    newLikedPosts[postId] = !isCurrentlyLiked
    setLikedPosts(newLikedPosts)

    // Save to local storage
    localStorage.setItem("likedPosts", JSON.stringify(newLikedPosts))

    // Update post votes
    const updatedPosts = community.posts.map((post: any) => {
      if (post.id === postId) {
        return {
          ...post,
          votes: isCurrentlyLiked ? post.votes - 1 : post.votes + 1,
        }
      }
      return post
    })

    setCommunity({
      ...community,
      posts: updatedPosts,
    })

    // Update posts in local storage
    try {
      const storedPosts = localStorage.getItem("posts")
      if (storedPosts) {
        const allPosts = JSON.parse(storedPosts)
        const updatedAllPosts = allPosts.map((post: any) => {
          if (post.id === postId) {
            return {
              ...post,
              votes: isCurrentlyLiked ? post.votes - 1 : post.votes + 1,
            }
          }
          return post
        })
        localStorage.setItem("posts", JSON.stringify(updatedAllPosts))
      }
    } catch (error) {
      console.error("Failed to update posts in local storage:", error)
    }
  }

  // Function to get thumbnail from local storage
  const getThumbnail = (thumbnailKey: string) => {
    if (!thumbnailKey || thumbnailKey.startsWith("/")) {
      return thumbnailKey || "/placeholder.svg?height=200&width=400" // It's a URL or path
    }

    try {
      const storedThumbnail = localStorage.getItem(thumbnailKey)
      return storedThumbnail || "/placeholder.svg?height=200&width=400"
    } catch (error) {
      console.error("Failed to get thumbnail from local storage:", error)
      return "/placeholder.svg?height=200&width=400"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-200 rounded-lg"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="container mx-auto max-w-4xl py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Community not found</h1>
        <p className="text-slate-500 mb-6">The community you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-blue-500 hover:bg-blue-600">
          <Link href="/communities">Browse Communities</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="community-header rounded-lg p-6 mb-6 shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">r/{community.name}</h1>
            <p className="text-blue-100 mt-2">{community.description}</p>
            <div className="flex items-center mt-4 text-sm text-blue-100">
              <Users className="mr-2 h-4 w-4" />
              <span>{community.members.toLocaleString()} members</span>
            </div>
          </div>
          <Button
            variant={isJoined ? "outline" : "default"}
            onClick={handleJoinCommunity}
            className={isJoined ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-white text-blue-600 hover:bg-blue-50"}
          >
            {isJoined ? "Leave" : "Join"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-6 bg-white border border-slate-200">
          <TabsTrigger value="posts" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            Posts
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Recent Posts</h2>
            <Button asChild className="bg-blue-500 hover:bg-blue-600">
              <Link href="/create-post">Create Post</Link>
            </Button>
          </div>

          {community.posts && community.posts.length > 0 ? (
            community.posts.map((post: any) => (
              <Card key={post.id} className="post-card overflow-hidden border border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                        <Link href={`/posts/${post.id}`}>{post.title}</Link>
                      </CardTitle>
                      <CardDescription>
                        Posted by {post.author} • {post.createdAt}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.thumbnail && (
                    <div className="mb-4 thumbnail-preview">
                      <Image
                        src={getThumbnail(post.thumbnail) || "/placeholder.svg?height=200&width=400"}
                        alt={post.title}
                        width={400}
                        height={225}
                        className="rounded-md"
                      />
                      <div className="thumbnail-overlay">
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/posts/${post.id}`}>View Post</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-slate-600 line-clamp-2">{post.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1 like-button ${likedPosts[post.id] ? "liked text-blue-500" : "text-slate-600"}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.votes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-600">
                      <MessageSquare className="h-4 w-4" />
                      <span>
                        {typeof post.comments === "number"
                          ? post.comments
                          : Array.isArray(post.comments)
                            ? post.comments.length
                            : 0}
                      </span>
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Link href={`/posts/${post.id}`}>View Post</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500">No posts yet. Be the first to post in this community!</p>
              <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-600">
                <Link href="/create-post">Create Post</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="about">
          <Card className="border border-slate-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <CardTitle>About r/{community.name}</CardTitle>
              <CardDescription className="text-blue-100">Community information and rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-medium mb-2 text-slate-800">Description</h3>
                <p className="text-slate-600">{community.description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-slate-800">Rules</h3>
                {community.rules && community.rules.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    {community.rules.map((rule: string, index: number) => (
                      <li key={index} className="pl-1">
                        {rule}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No specific rules have been set for this community yet.</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="font-medium mb-2 text-blue-800">Join our community</h3>
                <p className="text-blue-700 mb-4">
                  Become a member of r/{community.name} to post and participate in discussions.
                </p>
                <Button
                  onClick={handleJoinCommunity}
                  className={
                    isJoined
                      ? "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
                      : "bg-blue-500 hover:bg-blue-600"
                  }
                >
                  {isJoined ? "Leave Community" : "Join Community"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
