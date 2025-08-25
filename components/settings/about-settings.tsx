"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, User } from 'lucide-react'
import { toast } from 'sonner'

interface AboutForm {
  full_name: string
  title?: string
  company?: string
  bio?: string
  location?: string
  website?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  github?: string
  behance?: string
  dribbble?: string
}

export function AboutSettings() {
  const [form, setForm] = useState<AboutForm>({ full_name: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/settings/profile')
      const j = await res.json()
      const p = j.profile || {}
      setForm({
        full_name: p.profile_data?.name || p.full_name || '',
        title: p.profile_data?.title || p.title || '',
        company: p.profile_data?.company || p.company || '',
        bio: p.bio || p.profile_data?.bio || '',
        location: p.location || '',
        website: p.website || p.social_links?.website || '',
        instagram: p.social_links?.instagram || p.instagram || '',
        twitter: p.social_links?.twitter || p.twitter || '',
        linkedin: p.social_links?.linkedin || '',
        github: p.social_links?.github || '',
        behance: p.social_links?.behance || '',
        dribbble: p.social_links?.dribbble || ''
      })
    } catch {
      toast.error('Failed to load profile')
    } finally { setLoading(false) }
  }

  async function save() {
    try {
      setSaving(true)
      const res = await fetch('/api/settings/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Profile updated')
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>

  return (
    <Card className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Full Name</Label>
            <Input value={form.full_name} onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Title</Label>
            <Input value={form.title || ''} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Company</Label>
            <Input value={form.company || ''} onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Location</Label>
            <Input value={form.location || ''} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-white">Bio</Label>
            <Textarea value={form.bio || ''} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} className="min-h-[100px] bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Website</Label>
            <Input value={form.website || ''} onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Instagram</Label>
            <Input value={form.instagram || ''} onChange={e => setForm(prev => ({ ...prev, instagram: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Twitter/X</Label>
            <Input value={form.twitter || ''} onChange={e => setForm(prev => ({ ...prev, twitter: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">LinkedIn</Label>
            <Input value={form.linkedin || ''} onChange={e => setForm(prev => ({ ...prev, linkedin: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">GitHub</Label>
            <Input value={form.github || ''} onChange={e => setForm(prev => ({ ...prev, github: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Behance</Label>
            <Input value={form.behance || ''} onChange={e => setForm(prev => ({ ...prev, behance: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
          <div>
            <Label className="text-white">Dribbble</Label>
            <Input value={form.dribbble || ''} onChange={e => setForm(prev => ({ ...prev, dribbble: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


