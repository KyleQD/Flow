"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Upload, Link as LinkIcon, Image as ImageIcon, Video, Disc3, Shirt, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

type ItemType = 'album' | 'music' | 'video' | 'merch' | 'image' | 'link' | 'text'

interface PortfolioItem {
  id: string
  user_id: string
  type: ItemType
  title: string
  description?: string
  tags?: string[]
  media?: Array<{ kind: string; url: string; meta?: any }>
  links?: Array<{ label: string; url: string }>
  order_index: number
  is_public: boolean
}

export function PortfolioSettings() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({ type: 'image', title: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/settings/portfolio')
      const j = await res.json()
      setItems(j.items || [])
    } catch (e) {
      toast.error('Failed to load portfolio')
    } finally { setLoading(false) }
  }

  async function createItem() {
    if (!newItem.title || !newItem.type) return toast.error('Title is required')
    try {
      setCreating(true)
      const res = await fetch('/api/settings/portfolio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem)
      })
      if (!res.ok) throw new Error('Failed to create')
      const j = await res.json()
      setItems(prev => [...prev, j.item])
      setNewItem({ type: 'image', title: '' })
      toast.success('Item created')
    } catch (e:any) {
      toast.error(e.message || 'Failed to create item')
    } finally { setCreating(false) }
  }

  async function updateItem(id: string, patch: Partial<PortfolioItem>) {
    try {
      setSaving(true)
      const res = await fetch('/api/settings/portfolio', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch })
      })
      if (!res.ok) throw new Error('Failed to save')
      const j = await res.json()
      setItems(prev => prev.map(i => i.id === id ? j.item : i))
      toast.success('Saved')
    } catch (e:any) {
      toast.error(e.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  async function removeItem(id: string) {
    try {
      const res = await fetch(`/api/settings/portfolio?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Deleted')
    } catch (e:any) { toast.error(e.message || 'Failed to delete') }
  }

  async function upload(kind: 'image'|'video'|'audio'|'file', id?: string) {
    const input = fileRef.current
    if (!input || !input.files || input.files.length === 0) return toast.error('Choose a file')
    const file = input.files[0]
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', kind)
    fd.append('tos', 'accepted')
    const res = await fetch('/api/portfolio/upload', { method: 'POST', body: fd })
    const j = await res.json()
    if (!res.ok) return toast.error(j.error || 'Upload failed')
    if (id) {
      const it = items.find(i => i.id === id)
      const media = [...(it?.media || []) , { kind, url: j.url }]
      await updateItem(id, { media })
    } else {
      setNewItem(prev => ({ ...prev, media: [...(prev.media || []), { kind, url: j.url }] }))
    }
    input.value = ''
  }

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>

  return (
    <Card className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Type</Label>
                <Select value={(newItem.type as ItemType) || 'image'} onValueChange={v => setNewItem(prev => ({ ...prev, type: v as ItemType }))}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Photo/Album</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="merch">Merch</SelectItem>
                    <SelectItem value="link">Link/Embed</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Title</Label>
                <Input value={newItem.title || ''} onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))} className="bg-white/5 border-white/20 text-white rounded-xl" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-white">Description</Label>
                <Textarea value={newItem.description || ''} onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))} className="min-h-[100px] bg-white/5 border-white/20 text-white rounded-xl" />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input ref={fileRef} type="file" className="hidden" onChange={() => { /* keep ref */ }} />
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Choose File
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => upload('image')}><ImageIcon className="h-4 w-4 mr-2"/> Add Photo</Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => upload('video')}><Video className="h-4 w-4 mr-2"/> Add Video</Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => upload('audio')}><Disc3 className="h-4 w-4 mr-2"/> Add Audio</Button>
              </div>
              <div className="md:col-span-2">
                <Label className="text-white">Add Link</Label>
                <div className="flex gap-2">
                  <Input placeholder="Label" className="bg-white/5 border-white/20 text-white rounded-xl" onBlur={e => e.target.value && setNewItem(prev => ({ ...prev, links: [...(prev.links || []), { label: e.target.value, url: '' }] }))} />
                  <Input placeholder="https://" className="bg-white/5 border-white/20 text-white rounded-xl" onBlur={e => setNewItem(prev => ({ ...prev, links: [...(prev.links || []), { label: 'Link', url: e.target.value }] }))} />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={createItem} disabled={creating} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl">
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Plus className="h-4 w-4 mr-2" /> Add to Portfolio
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-white">
                    <GripVertical className="h-4 w-4 text-white/50" />
                    <Badge className="text-white bg-white/10 border-white/20">{item.type}</Badge>
                    <div className="font-semibold">{item.title}</div>
                  </div>
                  <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10 rounded-xl" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Title</Label>
                    <Input defaultValue={item.title} onBlur={e => updateItem(item.id, { title: e.target.value })} className="bg-white/5 border-white/20 text-white rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-white">Visibility</Label>
                    <Select defaultValue={item.is_public ? 'public' : 'private'} onValueChange={v => updateItem(item.id, { is_public: v === 'public' })}>
                      <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-white">Description</Label>
                    <Textarea defaultValue={item.description} onBlur={e => updateItem(item.id, { description: e.target.value })} className="min-h-[80px] bg-white/5 border-white/20 text-white rounded-xl" />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <input ref={fileRef} type="file" className="hidden" />
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => fileRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Choose File
                    </Button>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => upload('image', item.id)}><ImageIcon className="h-4 w-4 mr-2"/> Add Photo</Button>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => upload('video', item.id)}><Video className="h-4 w-4 mr-2"/> Add Video</Button>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl" onClick={() => upload('audio', item.id)}><Disc3 className="h-4 w-4 mr-2"/> Add Audio</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


