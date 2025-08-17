import { createClient } from '@/lib/supabase/server'
import { ForumThreadCard } from '@/components/forums/forum-thread-card'
import { CommentComposer } from '@/components/forums/comment-composer'

export default async function ThreadPage({ params }: { params: { slug: string, id: string } }) {
  const supabase = await createClient()

  const { data: forum } = await supabase
    .from('forums')
    .select('id, slug, name')
    .eq('slug', params.slug)
    .maybeSingle()
  if (!forum) return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-300">Forum not found</div>

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('id, title, body, url, score, comments_count, created_at, author:author_id(id, username, avatar_url, is_verified)')
    .eq('id', params.id)
    .maybeSingle()
  if (!thread) return <div className="max-w-3xl mx-auto px-4 py-8 text-slate-300">Thread not found</div>

  const { data: comments } = await supabase
    .from('forum_comments')
    .select('id, body, score, parent_comment_id, created_at, author:author_id(id, username, avatar_url, is_verified)')
    .eq('thread_id', params.id)
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6">
        <div className="text-xs text-slate-400 mb-2">
          in <a href={`/forums/${forum.slug}`} className="text-purple-300 hover:text-purple-200">{forum.name}</a>
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">{thread.title}</h1>
        {thread.body && (
          <div className="text-slate-300 mb-4 whitespace-pre-wrap">{thread.body}</div>
        )}
        {thread.url && (
          <div className="mb-4">
            <a href={thread.url} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline break-all">
              {thread.url}
            </a>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div>{thread.score || 0} points</div>
          <div>{thread.comments_count || 0} comments</div>
          <div>{new Date(thread.created_at).toLocaleString()}</div>
          {thread.author && (
            <div>by {thread.author.username}</div>
          )}
        </div>
      </div>
      <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4">
        <div className="text-white font-medium mb-3">Comments</div>
        <div className="mb-4">
          <CommentComposer threadId={thread.id} />
        </div>
        <div className="space-y-3">
          {(comments || []).map(c => (
            <div key={c.id} className="border border-slate-800/60 rounded-xl p-3">
              <div className="text-slate-300 text-sm whitespace-pre-wrap">{c.body}</div>
              <div className="text-xs text-slate-500 mt-1">{new Date(c.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


