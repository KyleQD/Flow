"use client"

import React from "react"
import AlbumCard from "./album-card"
import AlbumDialog from "./album-dialog"
import AlbumDetailDialog from "./album-detail-dialog"

interface Album {
  id: string
  title: string
  description: string
  event?: string
  isPublic: boolean
  images: string[]
  createdAt: string
  updatedAt: string
}

const initialAlbums: Album[] = []

export default function AlbumsGrid() {
  const [albums, setAlbums] = React.useState<Album[]>(initialAlbums)
  const [editingAlbum, setEditingAlbum] = React.useState<Album | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [viewingAlbum, setViewingAlbum] = React.useState<Album | null>(null)

  function handleAdd() {
    setEditingAlbum(null)
    setIsDialogOpen(true)
  }

  function handleEdit(album: Album) {
    setEditingAlbum(album)
    setIsDialogOpen(true)
  }

  function handleDelete(id: string) {
    setAlbums(albums => albums.filter(a => a.id !== id))
  }

  function handleSave(album: Album) {
    setAlbums(albums => {
      const exists = albums.some(a => a.id === album.id)
      if (exists) {
        return albums.map(a => (a.id === album.id ? album : a))
      }
      return [...albums, album]
    })
    setIsDialogOpen(false)
  }

  function handleView(album: Album) {
    setViewingAlbum(album)
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
        >
          Add Album
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {albums.map(album => (
          <AlbumCard
            key={album.id}
            album={album}
            onEdit={() => handleEdit(album)}
            onDelete={() => handleDelete(album.id)}
            onView={() => handleView(album)}
          />
        ))}
        {albums.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">No albums yet. Click 'Add Album' to get started.</div>
        )}
      </div>
      <AlbumDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        album={editingAlbum}
        onSave={handleSave}
      />
      <AlbumDetailDialog
        open={!!viewingAlbum}
        album={viewingAlbum}
        onClose={() => setViewingAlbum(null)}
      />
    </div>
  )
} 