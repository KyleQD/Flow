import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ForumThreadCard } from '@/components/forums/forum-thread-card'
import { QuickThreadComposer } from '@/components/forums/quick-thread-composer'

export default async function ForumsIndexPage({ searchParams }: { searchParams?: { sort?: string } }) {
  const supabase = await createClient()
  const sort = (searchParams?.sort || 'hot').toLowerCase()

  // Get forums for sidebar
  const { data: forums } = await supabase
    .from('forums')
    .select('id, slug, name, description')
    .order('name')

  // Get popular threads across all forums (Reddit homepage style)
  let query = supabase
    .from('forum_threads')
    .select(`
      id,
      title,
      body,
      url,
      score,
      comments_count,
      created_at,
      forum:forum_id(id, slug, name),
      author:author_id(id, username, avatar_url, is_verified)
    `)

  if (sort === 'new') query = query.order('created_at', { ascending: false })
  else if (sort === 'top') query = query.order('score', { ascending: false })
  else query = query.order('score', { ascending: false }).order('created_at', { ascending: false })

  const { data: threads } = await query.limit(25)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Popular Discussions</h1>
              <p className="text-slate-400">Hot topics from music communities</p>
            </div>
            <Link href="/forums/create" className="text-sm px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white">Create Forum</Link>
          </div>

          {/* Thread composer */}
          <QuickThreadComposer />

          {/* Sort controls */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-300">Sort:</span>
            <Link href="/forums?sort=hot" className={`px-3 py-1 rounded-lg ${sort === 'hot' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>🔥 Hot</Link>
            <Link href="/forums?sort=new" className={`px-3 py-1 rounded-lg ${sort === 'new' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>🆕 New</Link>
            <Link href="/forums?sort=top" className={`px-3 py-1 rounded-lg ${sort === 'top' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>⭐ Top</Link>
          </div>

          {/* Threads feed */}
          <div className="space-y-4">
            {(threads || []).map(t => (
              <ForumThreadCard
                key={t.id}
                id={t.id}
                forum={t.forum ? { slug: t.forum.slug, name: t.forum.name } : undefined}
                title={t.title}
                description={t.body || t.url || undefined}
                score={t.score || 0}
                comments={t.comments_count || 0}
                createdAt={t.created_at}
                author={t.author}
                onOpen={() => {
                  if (t.forum) {
                    window.location.href = `/forums/${t.forum.slug}/thread/${t.id}`
                  }
                }}
              />
            ))}
            
            {(!threads || threads.length === 0) && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">No discussions yet</div>
                <div className="text-slate-500 text-sm">Be the first to start a conversation!</div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4">
            <h2 className="text-white font-semibold mb-3">Music Communities</h2>
            <div className="space-y-2">
              {(forums || []).slice(0, 8).map(f => (
                <Link key={f.id} href={`/forums/${f.slug}`} className="block p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="text-white text-sm font-medium">{f.name}</div>
                  {f.description && (
                    <div className="text-slate-400 text-xs line-clamp-2">{f.description}</div>
                  )}
                </Link>
              ))}
              {forums && forums.length > 8 && (
                <Link href="/forums/all" className="block p-2 text-purple-300 hover:text-purple-200 text-sm">
                  View all forums →
                </Link>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-2">Community Stats</h3>
            <div className="space-y-1 text-sm">
              <div className="text-slate-300">{forums?.length || 0} Communities</div>
              <div className="text-slate-300">{threads?.length || 0} Active Discussions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


