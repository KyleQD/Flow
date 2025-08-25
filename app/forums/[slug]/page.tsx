import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SubscribeToggle } from '@/components/forums/subscribe-toggle'
import { QuickThreadComposer } from '@/components/forums/quick-thread-composer'

export default async function ForumPage(props: any) {
  const { params, searchParams } = props || {}
  const { slug } = (params || {}) as { slug: string }
  const sp = (searchParams || undefined) as { sort?: string, page?: string } | undefined
  const supabase = await createClient()
  const { data: forum } = await supabase
    .from('forums')
    .select('id, slug, name, description')
    .eq('slug', slug)
    .maybeSingle()

  if (!forum) return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-300">Forum not found</div>

  // Subscribers count and online estimate
  const { count: subscribers } = await supabase
    .from('forum_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('forum_id', forum.id)

  const estimatedOnline = Math.max(1, Math.floor((subscribers || 0) * 0.03))

  // Sorting and pagination
  const sort = (sp?.sort || 'hot').toLowerCase()
  const page = Math.max(1, parseInt(sp?.page || '1', 10))
  const limit = 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('forum_threads')
    .select('id, title, body, score, comments_count, created_at')
    .eq('forum_id', forum.id)

  if (sort === 'new') query = query.order('created_at', { ascending: false })
  else if (sort === 'top') query = query.order('score', { ascending: false })
  else query = query.order('score', { ascending: false }).order('created_at', { ascending: false })

  // Range for pagination
  // @ts-ignore - Supabase range available at runtime
  query = query.range(from, to)

  const { data: threads } = await query

  const hasPrev = page > 1
  const hasNext = (threads || []).length === limit

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{forum.name}</h1>
          <div className="text-slate-400 text-sm">{(subscribers || 0).toLocaleString()} subscribers • ~{estimatedOnline.toLocaleString()} online</div>
        </div>
        <SubscribeToggle slug={forum.slug} />
      </div>
      {forum.description && (
        <p className="text-slate-400">{forum.description}</p>
      )}
      <QuickThreadComposer />

      {/* Sort controls */}
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <span>Sort:</span>
        <Link href={`/forums/${slug}?sort=hot`} className={`px-2 py-1 rounded-lg ${sort === 'hot' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Hot</Link>
        <Link href={`/forums/${slug}?sort=new`} className={`px-2 py-1 rounded-lg ${sort === 'new' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>New</Link>
        <Link href={`/forums/${slug}?sort=top`} className={`px-2 py-1 rounded-lg ${sort === 'top' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>Top</Link>
      </div>
      <div className="space-y-3">
        {(threads || []).map(t => (
          <Link key={t.id} href={`/forums/${slug}/thread/${t.id}`} className="block bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 hover:border-purple-500/40">
            <div className="text-white font-medium">{t.title}</div>
            {t.body && <div className="text-slate-400 text-sm line-clamp-2">{t.body}</div>}
            <div className="text-xs text-slate-500 mt-1">{t.score} points • {t.comments_count} comments</div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        {hasPrev ? (
          <Link href={`/forums/${slug}?sort=${encodeURIComponent(sort)}&page=${page - 1}`} className="text-sm px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700">Previous</Link>
        ) : <div />}
        {hasNext && (
          <Link href={`/forums/${slug}?sort=${encodeURIComponent(sort)}&page=${page + 1}`} className="text-sm px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700">Next</Link>
        )}
      </div>
    </div>
  )
}


