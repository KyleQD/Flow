"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface Job {
  id: string
  title: string
  description: string
  requirements: string[]
  match_score: number
}

interface UserSkill {
  id: string
  name: string
  level: string
  years_of_experience: number
}

export default function SkillsMatcher() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserSkills()
    fetchJobs()
  }, [])

  const fetchUserSkills = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from("user_skills")
      .select("*")
      .eq("user_id", session.user.id)

    if (error) {
      toast.error("Failed to fetch user skills")
      return
    }

    setUserSkills(data || [])
  }

  const fetchJobs = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from("staff_jobs")
      .select("*")
      .eq("status", "active")

    if (error) {
      toast.error("Failed to fetch jobs")
      return
    }

    // Calculate match scores for each job
    const jobsWithScores = data?.map(job => {
      const requirements = job.requirements.split(",").map((req: string) => req.trim().toLowerCase())
      const userSkillNames = userSkills.map(skill => skill.name.toLowerCase())
      
      // Calculate match score based on required skills
      const matchingSkills = requirements.filter((req: string) => 
        userSkillNames.some(skill => skill.includes(req) || req.includes(skill))
      )
      const matchScore = (matchingSkills.length / requirements.length) * 100

      return {
        ...job,
        requirements: requirements,
        match_score: Math.round(matchScore)
      }
    }) || []

    // Sort jobs by match score
    jobsWithScores.sort((a, b) => b.match_score - a.match_score)
    setJobs(jobsWithScores)
    setLoading(false)
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {userSkills.map((skill) => (
          <Badge key={skill.id} variant="secondary">
            {skill.name} ({skill.level}, {skill.years_of_experience} years)
          </Badge>
        ))}
      </div>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{job.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Match Score:</span>
                  <Badge className={getMatchColor(job.match_score)}>
                    {job.match_score}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{job.description}</p>
              
              <div>
                <h4 className="font-medium mb-2">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, index) => {
                    const hasSkill = userSkills.some(skill => 
                      skill.name.toLowerCase().includes(req) || req.includes(skill.name.toLowerCase())
                    )
                    return (
                      <Badge
                        key={index}
                        variant={hasSkill ? "default" : "secondary"}
                      >
                        {req}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Skill Match</span>
                  <span>{job.match_score}%</span>
                </div>
                <Progress value={job.match_score} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 