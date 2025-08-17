import { createClient } from '@/lib/supabase/server'
import { ForumThreadCard } from '@/components/forums/forum-thread-card'
import { QuickThreadComposer } from '@/components/forums/quick-thread-composer'
import Link from 'next/link'

export default async function AllForumsPage({ searchParams }: { searchParams?: { sort?: string } }) {
  const supabase = await createClient()
  const sort = (searchParams?.sort || 'hot').toLowerCase()

  // Get all threads from all forums (Reddit-like experience)
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

  const { data: threads } = await query.limit(50)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Forums</h1>
          <p className="text-slate-400">Discover and discuss music with the community</p>
        </div>
        <div className="flex gap-2">
          <Link href="/forums" className="text-sm px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700">Browse Forums</Link>
          <Link href="/forums/create" className="text-sm px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white">Create Forum</Link>
        </div>
      </div>

      {/* Thread composer */}
      <QuickThreadComposer />

      {/* Sort controls */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-300">Sort:</span>
        <Link href="/forums/all?sort=hot" className={`px-3 py-1 rounded-lg ${sort === 'hot' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>🔥 Hot</Link>
        <Link href="/forums/all?sort=new" className={`px-3 py-1 rounded-lg ${sort === 'new' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>🆕 New</Link>
        <Link href="/forums/all?sort=top" className={`px-3 py-1 rounded-lg ${sort === 'top' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>⭐ Top</Link>
      </div>

      {/* Thread feed */}
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
            <div className="text-slate-400 mb-4">No threads yet</div>
            <div className="text-slate-500 text-sm">Be the first to start a conversation!</div>
          </div>
        )}
      </div>
    </div>
  )
}
