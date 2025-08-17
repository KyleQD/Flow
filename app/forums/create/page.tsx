import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CreateForumPage() {
  async function create(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const rawSlug = String(formData.get('slug') || '').trim().toLowerCase()
    const slug = rawSlug
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)
    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()
    if (!slug || !name) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    // Check uniqueness
    const { data: existing } = await supabase
      .from('forums')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (existing) return

    const { data, error } = await supabase
      .from('forums')
      .insert({ slug, name, description, created_by: user.id })
      .select('slug')
      .single()
    if (!error && data?.slug) redirect(`/forums/${data.slug}`)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold text-white">Create a forum</h1>
      <form action={create} className="space-y-3">
        <div>
          <label className="block text-slate-300 text-sm mb-1">Slug</label>
          <input name="slug" className="w-full rounded-xl bg-slate-900/50 border border-slate-800/60 px-3 py-2 text-white" placeholder="e.g. touring" />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-1">Name</label>
          <input name="name" className="w-full rounded-xl bg-slate-900/50 border border-slate-800/60 px-3 py-2 text-white" placeholder="Forum name" />
        </div>
        <div>
          <label className="block text-slate-300 text-sm mb-1">Description</label>
          <textarea name="description" className="w-full rounded-xl bg-slate-900/50 border border-slate-800/60 px-3 py-2 text-white min-h-[120px]" placeholder="Describe the forum (optional)" />
        </div>
        <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white">Create</button>
      </form>
    </div>
  )
}


