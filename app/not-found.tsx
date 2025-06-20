import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileQuestion className="h-5 w-5 text-slate-500" />
            <CardTitle>Page not found</CardTitle>
          </div>
          <CardDescription>
            The page you are looking for does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Please check the URL or navigate back to the homepage.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            asChild
            className="w-full"
          >
            <Link href="/">
              Go to homepage
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 