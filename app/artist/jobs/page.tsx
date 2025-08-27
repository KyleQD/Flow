import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/supabase/auth"
// @ts-nocheck
import { prisma } from "@/lib/prisma"
import { UpgradeToPro } from "@/components/upgrade-to-pro"

async function getJobs() {
  const jobs = await (prisma as any).job.findMany({
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      questions: true,
      documents: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  return jobs
}

export default async function JobsPage() {
  const session = await getServerSession(authOptions)
  const jobs = await getJobs()

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground mt-2">
            Find gigs, venues, and opportunities in the music industry
          </p>
        </div>
        {session?.user && (
          <div className="flex items-center gap-4">
            {true ? (
              <Link href="/jobs/new">
                <Button>Post a Job</Button>
              </Link>
            ) : (
              <UpgradeToPro />
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job: any) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>Posted by: {job.user.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {job.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{job.budget}</span>
                {session?.user ? (
                  true ? (
                    <Link href={`/jobs/${job.id}/apply`}>
                      <Button variant="outline" size="sm">Apply Now</Button>
                    </Link>
                  ) : (
                    <UpgradeToPro variant="outline" size="sm" />
                  )
                ) : (
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">Sign in to Apply</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 