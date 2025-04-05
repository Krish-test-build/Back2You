"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { Loader2, AlertCircle, CheckCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const CommunitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").max(50, "Name cannot exceed 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores and hyphens"),
  image: z.string().url("Must be a valid URL"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
})

type CommunityFormValues = z.infer<typeof CommunitySchema>

interface CreateCommunityFormProps {
  userId: string
}

function CreateCommunityForm({ userId }: CreateCommunityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [bioLength, setBioLength] = useState(0)
  const [isImageValid, setIsImageValid] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(CommunitySchema),
    defaultValues: {
      name: "",
      username: "",
      image: "",
      bio: "",
    },
  })

  const imageUrl = watch("image")
  const bioValue = watch("bio") || ""

  useEffect(() => {
    setBioLength(bioValue.length)
  }, [bioValue])

  const handleImageError = () => {
    setIsImageValid(false)
  }

  const handleImageLoad = () => {
    setIsImageValid(true)
  }

  const clearForm = () => {
    reset()
    setErrorMsg("")
    setSuccessMsg("")
  }

  const onSubmit = async (values: CommunityFormValues) => {
    try {
      setLoading(true)
      setErrorMsg("")
      setSuccessMsg("")

      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, createdById: userId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Failed to create community")
      }

      setSuccessMsg("Community created successfully!")
      reset()

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/communities")
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message)
      } else {
        setErrorMsg("Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 p-6 bg-black rounded-xl w-full border border-gray-800 shadow-lg"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-bold">Create a New Community</h2>
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearForm}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-900/30 border border-green-800 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{successMsg}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-gray-300">
            Community Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g. React Developers"
            className="bg-gray-900/50 border-gray-700 focus:border-white focus:ring-white text-white"
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium text-gray-300">
            Username (unique) <span className="text-red-500">*</span>
          </label>
          <Input
            id="username"
            {...register("username")}
            placeholder="e.g. reactdevs"
            className="bg-gray-900/50 border-gray-700 focus:border-white focus:ring-white text-white"
            aria-invalid={errors.username ? "true" : "false"}
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          <p className="text-xs text-gray-500">Only lowercase letters, numbers, underscores and hyphens allowed.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="image" className="text-sm font-medium text-gray-300">
            Community Image URL <span className="text-red-500">*</span>
          </label>
          <Input
            id="image"
            {...register("image")}
            placeholder="https://example.com/image.png"
            className="bg-gray-900/50 border-gray-700 focus:border-white focus:ring-white text-white"
            aria-invalid={errors.image ? "true" : "false"}
          />
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}

          {imageUrl && (
            <div className="mt-2 relative">
              <div className="h-24 w-24 rounded-md border border-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Community preview"
                  className="h-full w-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                {!isImageValid && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-red-500">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                )}
              </div>
              {!isImageValid && <p className="text-red-500 text-xs mt-1">Image could not be loaded</p>}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label htmlFor="bio" className="text-sm font-medium text-gray-300">
              Community Bio
            </label>
            <span
              className={`text-xs ${bioLength > 400 ? "text-amber-500" : "text-gray-500"} ${bioLength > 500 ? "text-red-500" : ""}`}
            >
              {bioLength}/500
            </span>
          </div>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="What's this community about?"
            className="bg-gray-900/50 text-white placeholder-gray-500 border-gray-700 focus:border-white focus:ring-white min-h-[100px]"
            aria-invalid={errors.bio ? "true" : "false"}
          />
          {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-white text-black hover:bg-gray-200">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Community"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateCommunityForm

