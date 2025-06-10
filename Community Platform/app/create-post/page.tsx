"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  community: z.string({
    required_error: "Please select a community",
  }),
})

export default function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [communities, setCommunities] = useState<any[]>([])

  useEffect(() => {
    // Load communities from local storage or use sample data
    try {
      const storedCommunities = localStorage.getItem("communities")
      if (storedCommunities) {
        setCommunities(JSON.parse(storedCommunities))
      } else {
        // Sample data if no communities in local storage
        const sampleCommunities = [
          { id: "1", name:   "Mental Health" },
          { id: "2", name: "Fitness" },
          { id: "3", name: "Arthiritis" },
          { id: "4", name: "Women's Health" },
        ]
        setCommunities(sampleCommunities)
        localStorage.setItem("communities", JSON.stringify(sampleCommunities))
      }
    } catch (error) {
      console.error("Failed to load communities:", error)
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      community: "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setThumbnailFile(file)

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setThumbnail(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const saveThumbnailToLocalStorage = (thumbnailData: string, fileName: string): string => {
    try {
      // Generate a unique key for this thumbnail
      const thumbnailKey = `thumbnail_${Date.now()}_${fileName.replace(/\s+/g, "_")}`

      // Store the thumbnail data in local storage
      localStorage.setItem(thumbnailKey, thumbnailData)

      // Return the key so we can reference it later
      return thumbnailKey
    } catch (error) {
      console.error("Error saving thumbnail to local storage:", error)
      // If local storage fails, return a placeholder
      return "/placeholder.svg?height=200&width=400"
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Get existing posts from local storage
      let posts = []
      try {
        const storedPosts = localStorage.getItem("posts")
        if (storedPosts) {
          posts = JSON.parse(storedPosts)
        }
      } catch (error) {
        console.error("Failed to load existing posts:", error)
      }

      // Process thumbnail if exists
      let thumbnailUrl = "/placeholder.svg?height=200&width=400"
      if (thumbnail && thumbnailFile) {
        thumbnailUrl = saveThumbnailToLocalStorage(thumbnail, thumbnailFile.name)
      }

      // Find the selected community
      const selectedCommunity = communities.find((c) => c.id === values.community)

      if (!selectedCommunity) {
        toast({
          title: "Error",
          description: "Selected community not found. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Create new post
      const newPost = {
        id: `post_${Date.now()}`,
        title: values.title,
        content: values.content,
        communityId: values.community,
        community: selectedCommunity.name,
        author: "current_user", // In a real app, this would be the current user
        votes: 0,
        comments: [],
        createdAt: "Just now",
        thumbnail: thumbnailUrl,
      }

      // Add new post to posts array
      posts.unshift(newPost)

      // Save updated posts to local storage
      localStorage.setItem("posts", JSON.stringify(posts))

      toast({
        title: "Post created!",
        description: "Your post has been created successfully.",
      })

      // Redirect to the home page
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <Card className="border border-slate-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
          <CardTitle>Create a Post</CardTitle>
          <CardDescription className="text-blue-100">Share something with the community</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="community"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-slate-200">
                          <SelectValue placeholder="Select a community" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {communities.map((community) => (
                          <SelectItem key={community.id} value={community.id}>
                            r/{community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select the community where you want to post</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Post title" {...field} className="border-slate-200" />
                    </FormControl>
                    <FormDescription>Keep your title clear and descriptive</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel htmlFor="thumbnail">Thumbnail Image</FormLabel>
                <div className="mt-2">
                  {thumbnail ? (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-slate-200">
                      <Image
                        src={thumbnail || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={removeThumbnail}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-md cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Click to upload thumbnail image</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="thumbnail"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2">Adding a thumbnail will make your post more engaging</p>
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What do you want to share?"
                        className="min-h-[200px] resize-none border-slate-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                  className="border-slate-200 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
                >
                  {isSubmitting ? "Posting..." : "Create Post"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
