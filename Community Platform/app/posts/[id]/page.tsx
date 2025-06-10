"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowLeft, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Load post from local storage
    const loadPost = () => {
      try {
        const storedPosts = localStorage.getItem("posts")
        if (storedPosts) {
          const posts = JSON.parse(storedPosts)
          const foundPost = posts.find((p: any) => p.id === params.id)

          if (foundPost) {
            // If post has no comments array, add it
            if (!foundPost.comments) {
              foundPost.comments = []
            } else if (!Array.isArray(foundPost.comments)) {
              // If comments is a number (count), convert to array
              foundPost.comments = []
            }

            setPost(foundPost)
          }
        }
      } catch (error) {
        console.error("Failed to load post:", error)
      } finally {
        setLoading(false)
      }
    }

    // Check if post is liked
    const checkLikedStatus = () => {
      try {
        const storedLikedPosts = localStorage.getItem("likedPosts")
        if (storedLikedPosts) {
          const likedPosts = JSON.parse(storedLikedPosts)
          setLiked(likedPosts[params.id] || false)
        }
      } catch (error) {
        console.error("Failed to check liked status:", error)
      }
    }

    loadPost()
    checkLikedStatus()
  }, [params.id])

  const handleLike = () => {
    if (!post) return

    // Toggle like status
    const newLiked = !liked
    setLiked(newLiked)

    // Update post votes
    const updatedPost = {
      ...post,
      votes: newLiked ? post.votes + 1 : post.votes - 1,
    }
    setPost(updatedPost)

    // Update in local storage
    try {
      // Update liked posts
      const storedLikedPosts = localStorage.getItem("likedPosts")
      const likedPosts = storedLikedPosts ? JSON.parse(storedLikedPosts) : {}
      likedPosts[post.id] = newLiked
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts))

      // Update post in posts array
      const storedPosts = localStorage.getItem("posts")
      if (storedPosts) {
        const posts = JSON.parse(storedPosts)
        const updatedPosts = posts.map((p: any) => (p.id === post.id ? updatedPost : p))
        localStorage.setItem("posts", JSON.stringify(updatedPosts))
      }
    } catch (error) {
      console.error("Failed to update like status:", error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create new comment
      const newComment = {
        id: `comment_${Date.now()}`,
        author: "current_user", // In a real app, this would be the current user
        content: comment,
        votes: 0,
        createdAt: "Just now",
      }

      // Add the new comment to the post
      const updatedPost = {
        ...post,
        comments: Array.isArray(post.comments) ? [...post.comments, newComment] : [newComment],
      }

      setPost(updatedPost)

      // Update post in local storage
      try {
        const storedPosts = localStorage.getItem("posts")
        if (storedPosts) {
          const posts = JSON.parse(storedPosts)
          const updatedPosts = posts.map((p: any) => (p.id === post.id ? updatedPost : p))
          localStorage.setItem("posts", JSON.stringify(updatedPosts))
        }
      } catch (error) {
        console.error("Failed to update post in local storage:", error)
      }

      // Clear the comment input
      setComment("")

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
      <div className="container mx-auto max-w-3xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto max-w-3xl py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <p className="text-slate-500 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="bg-blue-500 hover:bg-blue-600">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <Button variant="ghost" className="mb-4 pl-2 text-slate-600 hover:text-slate-900" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="border border-slate-200 shadow-md overflow-hidden">
        <CardHeader className="pb-0">
          <div>
            <div className="mb-2">
              <Link
                href={`/communities/${post.communityId}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                r/{post.community}
              </Link>
              <span className="text-sm text-slate-500">
                {" "}
                • Posted by {post.author} • {post.createdAt}
              </span>
            </div>
            <CardTitle className="text-2xl">{post.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {post.thumbnail && (
            <div className="mb-4 w-full max-h-96 overflow-hidden rounded-md">
              <Image
                src={getThumbnail(post.thumbnail) || "/placeholder.svg"}
                alt={post.title}
                width={800}
                height={450}
                className="w-full object-cover"
              />
            </div>
          )}
          <div className="whitespace-pre-line text-slate-700">{post.content}</div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${liked ? "text-blue-500 border-blue-200 bg-blue-50" : "text-slate-600"}`}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className="font-medium">{post.votes}</span>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-slate-600"
              onClick={() => setLiked(false)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center text-slate-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>{Array.isArray(post.comments) ? post.comments.length : 0} comments</span>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Comments</h2>

        <Card className="mb-6 border border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitComment}>
              <Textarea
                placeholder="What are your thoughts?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none mb-4 border-slate-200 focus-visible:ring-blue-500"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600">
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array.isArray(post.comments) && post.comments.length > 0 ? (
            post.comments.map((comment: any) => (
              <Card
                key={comment.id}
                className="border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={comment.author} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {comment.author.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-slate-800">{comment.author}</span>
                        <span className="ml-2 text-xs text-slate-500">{comment.createdAt}</span>
                      </div>
                      <p className="mt-1 text-slate-600">{comment.content}</p>

                      <div className="flex items-center mt-2 space-x-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500 hover:text-blue-600">
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">{comment.votes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-slate-500 hover:text-blue-600"
                        >
                          Reply
                        </Button>
                      </div>

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l border-slate-200 space-y-4">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="flex items-start space-x-3">
                              <Avatar className="h-6 w-6 border border-slate-200">
                                <AvatarImage src={`/placeholder.svg?height=24&width=24`} alt={reply.author} />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {reply.author.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium text-sm text-slate-800">{reply.author}</span>
                                  <span className="ml-2 text-xs text-slate-500">{reply.createdAt}</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">{reply.content}</p>

                                <div className="flex items-center mt-2 space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-slate-500 hover:text-blue-600"
                                  >
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    <span className="text-xs">{reply.votes}</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-slate-500 hover:text-blue-600"
                                  >
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="text-slate-500">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
