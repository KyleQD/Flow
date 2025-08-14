export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-black text-white p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-72 bg-slate-800/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-900/50 border border-slate-700/50 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-slate-900/50 border border-slate-700/50 rounded-2xl" />
            <div className="h-64 bg-slate-900/50 border border-slate-700/50 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-56 bg-slate-900/50 border border-slate-700/50 rounded-2xl" />
            <div className="h-64 bg-slate-900/50 border border-slate-700/50 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}


