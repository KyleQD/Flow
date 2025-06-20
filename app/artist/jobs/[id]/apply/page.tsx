"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { UpgradeToPro } from "@/components/upgrade-to-pro"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  description: string
  questions: { id: string; text: string }[]
  documents: { id: string; type: string }[]
}

export default function ApplyToJobPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const params = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eventId, setEventId] = useState("")
  const [role, setRole] = useState("")
  const [events, setEvents] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events")
        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
      }
    }

    if (session?.user) {
      fetchEvents()
    }
  }, [session])

  // Fetch job details
  useState(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch job")
        const data = await response.json()
        setJob(data)
        
        // Initialize answers and files state
        const initialAnswers: Record<string, string> = {}
        const initialFiles: Record<string, File | null> = {}
        
        data.questions.forEach((q: { id: string }) => {
          initialAnswers[q.id] = ""
        })
        
        data.documents.forEach((d: { id: string }) => {
          initialFiles[d.id] = null
        })
        
        setAnswers(initialAnswers)
        setFiles(initialFiles)
      } catch (error) {
        console.error("Error fetching job:", error)
      }
    }

    fetchJob()
  }, [params.id])

  if (!session) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign in to apply</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to apply for this job.</p>
                            <Button onClick={() => router.push("/login")} className="mt-4">
              Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session.user.isPro) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need a pro account to apply for jobs.</p>
            <UpgradeToPro className="mt-4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p>Loading...</p>
      </div>
    )
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleFileChange = (documentId: string, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [documentId]: file
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !session) return

    setIsSubmitting(true)

    try {
      // Upload files first
      const uploads = []
      for (const [documentId, file] of Object.entries(files)) {
        if (file) {
          const formData = new FormData()
          formData.append("file", file)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) throw new Error("Failed to upload file")

          const { url } = await uploadResponse.json()
          uploads.push({ documentId, url })
        }
      }

      // Submit application
      const response = await fetch(`/api/jobs/${job.id}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, text]) => ({
            questionId,
            text,
          })),
          uploads,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit application")

      router.push("/jobs")
    } catch (error) {
      console.error("Error submitting application:", error)
      // Handle error (show toast or error message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHire = async () => {
    if (!eventId || !role) {
      toast.error("Please select an event and role")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/applications/${params.id}/hire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, role }),
      })

      if (!response.ok) {
        throw new Error("Failed to hire applicant")
      }

      toast.success("Applicant hired successfully")
      router.push(`/events/${eventId}`)
    } catch (error) {
      console.error("Error hiring applicant:", error)
      toast.error("Failed to hire applicant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Apply for {job?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {job.questions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <Label>{question.text}</Label>
                  <Textarea
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Your answer..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Required Documents</h3>
              
              <div className="space-y-4">
                {job.documents.map((document) => (
                  <div key={document.id} className="space-y-2">
                    <Label>{document.type}</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        className="flex-1"
                        onChange={(e) => handleFileChange(document.id, e.target.files?.[0] || null)}
                        required
                      />
                      {files[document.id] && (
                        <span className="text-sm text-muted-foreground">
                          {files[document.id]?.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {session.user.id === job?.userId && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Hire Applicant</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event">Select Event</Label>
                    <Select value={eventId} onValueChange={setEventId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events?.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Enter role (e.g., Sound Engineer, Lighting Technician)"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleHire}
                    disabled={loading || !eventId || !role}
                  >
                    {loading ? "Hiring..." : "Hire Applicant"}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 