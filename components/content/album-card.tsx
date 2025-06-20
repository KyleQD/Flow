"use client"

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

interface AlbumCardProps {
  album: Album
  onEdit: () => void
  onDelete: () => void
  onView: () => void
}

export default function AlbumCard({ album, onEdit, onDelete, onView }: AlbumCardProps) {
  return (
    <div className="bg-[#181b23] border border-gray-800 rounded-xl p-3 flex flex-col gap-2 shadow-sm cursor-pointer hover:shadow-lg transition" onClick={onView}>
      <div className="aspect-[4/3] w-full bg-[#23232a] rounded-lg overflow-hidden flex items-center justify-center mb-2">
        {album.images && album.images.length > 0 ? (
          <img src={album.images[0]} alt={album.title} className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-500 text-sm">No cover</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="font-semibold text-white truncate">{album.title}</div>
        <span className="text-xs text-gray-400">{album.images.length} photos</span>
      </div>
      <div className="flex gap-2 mt-1">
        <button onClick={e => { e.stopPropagation(); onEdit() }} className="p-2 rounded-lg bg-[#23232a] hover:bg-purple-600/80 text-purple-400 hover:text-white transition-colors" aria-label="Edit album">
          Edit
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete() }} className="p-2 rounded-lg bg-[#23232a] hover:bg-red-600/80 text-red-400 hover:text-white transition-colors" aria-label="Delete album">
          Delete
        </button>
      </div>
    </div>
  )
} 