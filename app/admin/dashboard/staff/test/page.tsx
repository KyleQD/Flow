import TestJobPosting from '../test-job-posting'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Job Posting Test</h1>
        <TestJobPosting />
      </div>
    </div>
  )
} 