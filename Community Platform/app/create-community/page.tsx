"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Define proper types for community data
interface Community {
  id: string
  name: string
  description: string
  members: number
  rules: string[]
}

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Community name must be at least 3 characters" })
    .max(21, { message: "Community name must be less than 21 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Only letters, numbers, and underscores are allowed" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(300, { message: "Description must be less than 300 characters" }),
  rules: z.string().max(1000, { message: "Rules must be less than 1000 characters" }).optional(),
})

export default function CreateCommunityPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Check if localStorage is available
  const isLocalStorageAvailable = () => {
    try {
      const testKey = "__test__"
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    // Check localStorage availability first
    if (!isLocalStorageAvailable()) {
      toast({
        title: "Storage Error",
        description: "Local storage is not available. Your communities may not be saved.",
        variant: "destructive",
      })
      return
    }

    // Load existing communities with safer parsing
    try {
      const storedCommunities = localStorage.getItem("communities")
      if (storedCommunities) {
        try {
          const parsedCommunities = JSON.parse(storedCommunities)
          // Validate that we have an array
          if (Array.isArray(parsedCommunities)) {
            setCommunities(parsedCommunities)
          } else {
            throw new Error("Stored communities is not an array")
          }
        } catch (parseError) {
          console.error("Failed to parse communities:", parseError)
          localStorage.removeItem("communities") // Clear invalid data
          setCommunities([])
        }
      }
    } catch (error) {
      console.error("Failed to load communities:", error)
      toast({
        title: "Error",
        description: "Failed to load existing communities.",
        variant: "destructive",
      })
    }
  }, [toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      rules: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Verify localStorage is available before proceeding
      if (!isLocalStorageAvailable()) {
        throw new Error("Local storage is not available")
      }

      // Check if community name already exists
      const communityExists = communities.some(
        (community) => community.name.toLowerCase() === values.name.toLowerCase(),
      )

      if (communityExists) {
        toast({
          title: "Community already exists",
          description: `A community with the name r/${values.name} already exists.`,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Generate a more robust unique ID
      const generateUniqueId = () => {
        return `community_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Create new community with proper typing
      const newCommunity: Community = {
        id: generateUniqueId(),
        name: values.name,
        description: values.description,
        members: 1,
        rules: values.rules ? values.rules.split("\n").filter((rule) => rule.trim().length > 0) : [],
      }

      // Add to communities list
      const updatedCommunities = [...communities, newCommunity]
      setCommunities(updatedCommunities)
      localStorage.setItem("communities", JSON.stringify(updatedCommunities))

      // Add to user's joined communities
      try {
        const storedUserCommunities = localStorage.getItem("userCommunities")
        const userCommunities = storedUserCommunities ? JSON.parse(storedUserCommunities) : []

        userCommunities.push({
          id: newCommunity.id,
          name: newCommunity.name,
        })

        localStorage.setItem("userCommunities", JSON.stringify(userCommunities))
      } catch (error) {
        console.error("Failed to update user communities:", error)
        toast({
          title: "Warning",
          description: "Created community but failed to add to your communities.",
          variant: "destructive",
        })
      }

      toast({
        title: "Community created!",
        description: `r/${values.name} has been created successfully.`,
      })

      // Use try/catch for navigation to handle any errors
      try {
        router.push(`/communities/${newCommunity.id}`)
      } catch (routeError) {
        console.error("Navigation error:", routeError)
        // Provide a fallback navigation
        window.location.href = `/communities/${newCommunity.id}`
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
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
          <CardTitle>Create a Medical Community</CardTitle>
          <CardDescription className="text-blue-100">
            Create a specialized community for healthcare professionals or patients to discuss medical topics, share research, and connect with others in your field
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-800">Community Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="mr-2 text-slate-500">r/</span>
                        <Input
                          placeholder="Dermatology, Cardiology, Pulmonology..."
                          {...field}
                          className="border-slate-200 focus-visible:ring-blue-500"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Choose a name related to a medical specialty or health condition. You cannot change this later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-800">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What is your community about?"
                        className="resize-none border-slate-200 focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      This will help people understand what your community is about.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-800">Community Rules (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter community rules and guidelines (one per line)..."
                        className="resize-none min-h-[120px] border-slate-200 focus-visible:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Set guidelines for your community members to follow. Enter each rule on a new line.
                    </FormDescription>
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
                  {isSubmitting ? "Creating..." : "Create Community"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
