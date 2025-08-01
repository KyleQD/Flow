/**
 * Utility functions for handling media display across feed components
 */

export interface MediaItem {
  id?: string
  type: 'image' | 'video'
  url: string
  alt_text?: string
  alt?: string
  thumbnail_url?: string | null
}

/**
 * Normalizes media data from various API response formats
 */
export function normalizeMediaData(post: any): MediaItem[] {
  let mediaItems: MediaItem[] = []
  
  if (post.media && Array.isArray(post.media)) {
    mediaItems = post.media
  } else if (post.media_urls && Array.isArray(post.media_urls)) {
    mediaItems = post.media_urls.map((url: string, index: number) => ({
      id: `${post.id}-media-${index}`,
      type: 'image',
      url: url,
      alt_text: `Media ${index + 1}`
    }))
  } else if (post.post_media && Array.isArray(post.post_media)) {
    mediaItems = post.post_media
  } else if (post.media_items && Array.isArray(post.media_items)) {
    mediaItems = post.media_items
  }

  return mediaItems
}

/**
 * Renders media content based on the number of items
 */
export function renderMediaContent(mediaItems: MediaItem[]) {
  if (!mediaItems || mediaItems.length === 0) return null

  return (
    <div className="mt-4">
      {mediaItems.length === 1 ? (
        // Single image/video - full width
        <div className="relative rounded-xl overflow-hidden">
          {mediaItems[0].type === "image" || !mediaItems[0].type ? (
            <img
              src={mediaItems[0].url}
              alt={mediaItems[0].alt || mediaItems[0].alt_text || "Post media"}
              className="w-full h-auto max-h-96 object-cover"
              loading="lazy"
            />
          ) : (
            <video
              src={mediaItems[0].url}
              poster={mediaItems[0].thumbnail_url ?? undefined}
              className="w-full h-auto max-h-96 object-cover"
              controls
            />
          )}
        </div>
      ) : mediaItems.length === 2 ? (
        // Two images/videos - side by side
        <div className="grid grid-cols-2 gap-2">
          {mediaItems.slice(0, 2).map((item, index) => (
            <div key={item.id || index} className="relative rounded-xl overflow-hidden">
              {item.type === "image" || !item.type ? (
                <img
                  src={item.url}
                  alt={item.alt || item.alt_text || "Post media"}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.url}
                  poster={item.thumbnail_url ?? undefined}
                  className="w-full h-48 object-cover"
                  controls
                />
              )}
            </div>
          ))}
        </div>
      ) : mediaItems.length === 3 ? (
        // Three images/videos - 2 on top, 1 on bottom
        <div className="grid grid-cols-2 gap-2">
          <div className="row-span-2">
            {mediaItems[0].type === "image" || !mediaItems[0].type ? (
              <img
                src={mediaItems[0].url}
                alt={mediaItems[0].alt || mediaItems[0].alt_text || "Post media"}
                className="w-full h-full object-cover rounded-xl"
                loading="lazy"
              />
            ) : (
              <video
                src={mediaItems[0].url}
                poster={mediaItems[0].thumbnail_url ?? undefined}
                className="w-full h-full object-cover rounded-xl"
                controls
              />
            )}
          </div>
          <div className="space-y-2">
            {mediaItems.slice(1, 3).map((item, index) => (
              <div key={item.id || index} className="relative rounded-xl overflow-hidden">
                {item.type === "image" || !item.type ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.alt_text || "Post media"}
                    className="w-full h-24 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    poster={item.thumbnail_url ?? undefined}
                    className="w-full h-24 object-cover"
                    controls
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Four or more images/videos - 2x2 grid with overlay
        <div className="grid grid-cols-2 gap-2">
          {mediaItems.slice(0, 4).map((item, index) => (
            <div key={item.id || index} className="relative rounded-xl overflow-hidden">
              {item.type === "image" || !item.type ? (
                <img
                  src={item.url}
                  alt={item.alt || item.alt_text || "Post media"}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.url}
                  poster={item.thumbnail_url ?? undefined}
                  className="w-full h-48 object-cover"
                  controls
                />
              )}
              {index === 3 && mediaItems.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    +{mediaItems.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 