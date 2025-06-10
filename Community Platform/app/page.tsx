"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowUpRight, MessageSquare, ThumbsUp } from "lucide-react"
import Image from "next/image"

// Define proper post type to ensure type safety
interface Post {
  id: string;
  title: string;
  content: string;
  community: string;
  author: string;
  votes: number;
  comments: number;
  createdAt: string;
  thumbnail?: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})

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

  useEffect(() => {
    // Load posts from local storage or use sample data
    const loadPosts = () => {
      try {
        const storedPosts = localStorage.getItem("posts")
        if (storedPosts) {
          // Safely parse posts and ensure they're valid
          const parsedPosts = JSON.parse(storedPosts);
          if (Array.isArray(parsedPosts)) {
            // Sanitize posts to ensure no objects are directly rendered
            const sanitizedPosts = parsedPosts.map(post => ({
              id: String(post.id || ''),
              title: String(post.title || ''),
              content: String(post.content || ''),
              community: String(post.community || ''),
              author: String(post.author || ''),
              votes: Number(post.votes || 0),
              comments: Number(post.comments || 0),
              createdAt: String(post.createdAt || ''),
              thumbnail: post.thumbnail ? String(post.thumbnail) : '/placeholder.svg?height=200&width=400'
            }));
            setPosts(sanitizedPosts);
          } else {
            throw new Error("Invalid posts data structure");
          }
        } else {
          // Sample data with medical-themed content
          const samplePosts: Post[] = [
            {
              id: "1",
              title: "Welcome to the Medical Community Hub!",
              content:
                "This is your space to connect with healthcare professionals and patients, share medical experiences, and explore various health topics. Join a community that aligns with your medical interests!",
              community: "MedicalAnnouncements",
              author: "dr_admin",
              votes: 42,
              comments: 7,
              createdAt: "2 hours ago",
              thumbnail: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "2",
              title: "New Research on Eczema Treatment Options",
              content:
                "Recent dermatological studies have shown promising results with combination therapies for moderate to severe eczema. I've summarized the key findings and potential treatment pathways. What has worked for your patients?",
              community: "Dermatology",
              author: "skin_specialist",
              votes: 34,
              comments: 10,
              createdAt: "5 hours ago",
              thumbnail: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "3",
              title: "Managing COPD Symptoms During Seasonal Changes",
              content:
                "For those with chronic lung conditions, I've compiled breathing exercises and preventative measures specifically for the changing seasons. These techniques have helped my patients maintain better lung function during weather transitions.",
              community: "Pulmonology",
              author: "respiratory_care",
              votes: 19,
              comments: 6,
              createdAt: "1 day ago",
              thumbnail: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "4",
              title: "Heart-Healthy Mediterranean Diet Modifications",
              content: 
                "As a cardiologist, I've been recommending specific Mediterranean diet adaptations for patients with various heart conditions. Here's my evidence-based approach with meal plans and recipes suitable for cardiac patients.",
              community: "Cardiology",
              author: "heart_health_md",
              votes: 27,
              comments: 8,
              createdAt: "2 days ago",
              thumbnail: "/placeholder.svg?height=200&width=400",
            },
            {
              id: "5",
              title: "Advances in Non-Invasive Glucose Monitoring",
              content: 
                "New technologies for diabetes management are emerging rapidly. I've been testing the latest non-invasive glucose monitoring devices with my patients. Here's a comparison of accuracy and user experience across various options.",
              community: "Endocrinology",
              author: "diabetes_specialist",
              votes: 31,
              comments: 12,
              createdAt: "3 days ago",
              thumbnail: "/placeholder.svg?height=200&width=400",
            }
          ];
          
          setPosts(samplePosts)
          localStorage.setItem("posts", JSON.stringify(samplePosts))
        }
      } catch (error) {
        console.error("Failed to load posts:", error)
        // If there was an error, set empty posts array
        setPosts([]);
      }
    }

    // Load liked posts from local storage
    const loadLikedPosts = () => {
      try {
        const storedLikedPosts = localStorage.getItem("likedPosts")
        if (storedLikedPosts) {
          setLikedPosts(JSON.parse(storedLikedPosts))
        }
      } catch (error) {
        console.error("Failed to load liked posts:", error)
      }
    }

    loadPosts()
    loadLikedPosts()
  }, [])

  const handleLike = (postId: string) => {
    // Toggle like status
    const newLikedPosts = { ...likedPosts }
    const isCurrentlyLiked = newLikedPosts[postId]

    newLikedPosts[postId] = !isCurrentlyLiked
    setLikedPosts(newLikedPosts)

    // Save to local storage
    localStorage.setItem("likedPosts", JSON.stringify(newLikedPosts))

    // Update post votes
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          votes: isCurrentlyLiked ? post.votes - 1 : post.votes + 1,
        }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("posts", JSON.stringify(updatedPosts))
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Popular Posts
        </h1>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
        >
          <Link href="/create-post">Create Post</Link>
        </Button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="post-card overflow-hidden border border-slate-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                    <Link href={`/posts/${post.id}`}>{String(post.title)}</Link>
                  </CardTitle>
                  <CardDescription>
                    Posted in{" "}
                    <Link
                      href={`/communities/${String(post.community).toLowerCase()}`}
                      className="text-blue-600 hover:underline"
                    >
                      r/{String(post.community)}
                    </Link>{" "}
                    by {String(post.author)} • {String(post.createdAt)}
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
                    src={getThumbnail(post.thumbnail) || "/placeholder.svg"}
                    alt={String(post.title)}
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
              <p className="text-slate-600 line-clamp-2">{String(post.content)}</p>
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
                  <span>{post.comments}</span>
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
        ))}
      </div>
    </div>
  )
}
