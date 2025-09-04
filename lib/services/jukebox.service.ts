export interface Song {
  id: string
  title: string
  artist: string
  duration: number
  albumArt?: string
  genre: string
  isLiked: boolean
  audioUrl?: string
  releaseDate?: string
  bpm?: number
  key?: string
  tags?: string[]
}

export interface Playlist {
  id: string
  name: string
  description?: string
  songs: Song[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
  createdBy: string
}

export interface JukeboxState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isShuffled: boolean
  repeatMode: 'none' | 'one' | 'all'
  playlist: Song[]
  queue: Song[]
  history: Song[]
}

export class JukeboxService {
  private static instance: JukeboxService
  private state: JukeboxState

  private constructor() {
    this.state = {
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,
      isShuffled: false,
      repeatMode: 'none',
      playlist: [],
      queue: [],
      history: []
    }
  }

  static getInstance(): JukeboxService {
    if (!JukeboxService.instance) {
      JukeboxService.instance = new JukeboxService()
    }
    return JukeboxService.instance
  }

  // Get sample songs for demo
  getSampleSongs(): Song[] {
    return [
      {
        id: "ayce-intro",
        title: "AYCE Swandive",
        artist: "AYCE",
        duration: 5290, // 88:10
        genre: "Electronic",
        isLiked: true,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-01-01",
        bpm: 128,
        key: "D Minor",
        tags: ["ayce", "electronic", "swandive", "intro", "ambient"]
      },
      {
        id: "1",
        title: "Midnight Groove",
        artist: "The Night Owls",
        duration: 237, // 3:57
        genre: "Jazz",
        isLiked: true,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-01-15",
        bpm: 120,
        key: "C Major",
        tags: ["jazz", "smooth", "night", "groove"]
      },
      {
        id: "2", 
        title: "Electric Dreams",
        artist: "Neon Pulse",
        duration: 184, // 3:04
        genre: "Electronic",
        isLiked: false,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-02-20",
        bpm: 128,
        key: "D Minor",
        tags: ["electronic", "synth", "dreamy", "pulse"]
      },
      {
        id: "3",
        title: "Acoustic Sunset",
        artist: "Sarah Rivers",
        duration: 312, // 5:12
        genre: "Folk",
        isLiked: true,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-03-10",
        bpm: 85,
        key: "G Major",
        tags: ["folk", "acoustic", "sunset", "peaceful"]
      },
      {
        id: "4",
        title: "Rock Anthem",
        artist: "Thunder Road",
        duration: 268, // 4:28
        genre: "Rock",
        isLiked: false,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-01-30",
        bpm: 140,
        key: "E Major",
        tags: ["rock", "anthem", "powerful", "guitar"]
      },
      {
        id: "5",
        title: "Smooth Operator",
        artist: "The Groove Collective",
        duration: 195, // 3:15
        genre: "R&B",
        isLiked: true,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-02-15",
        bpm: 95,
        key: "F Minor",
        tags: ["r&b", "smooth", "groove", "soul"]
      },
      {
        id: "6",
        title: "Digital Rain",
        artist: "Cyber Beats",
        duration: 223, // 3:43
        genre: "Electronic",
        isLiked: false,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-03-05",
        bpm: 135,
        key: "A Minor",
        tags: ["electronic", "cyber", "digital", "beats"]
      },
      {
        id: "7",
        title: "Country Roads",
        artist: "Mountain Folk",
        duration: 245, // 4:05
        genre: "Country",
        isLiked: true,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-01-25",
        bpm: 90,
        key: "D Major",
        tags: ["country", "roads", "mountain", "folk"]
      },
      {
        id: "8",
        title: "Blues Night",
        artist: "Delta Soul",
        duration: 289, // 4:49
        genre: "Blues",
        isLiked: false,
        albumArt: "/images/album-placeholder.svg",
        releaseDate: "2024-02-28",
        bpm: 75,
        key: "A Major",
        tags: ["blues", "night", "soul", "delta"]
      }
    ]
  }

  // Get current state
  getState(): JukeboxState {
    return { ...this.state }
  }

  // Set current song
  setCurrentSong(song: Song | null): void {
    this.state.currentSong = song
    if (song) {
      this.addToHistory(song)
    }
  }

  // Toggle play/pause
  togglePlay(): boolean {
    this.state.isPlaying = !this.state.isPlaying
    return this.state.isPlaying
  }

  // Set playing state
  setPlaying(isPlaying: boolean): void {
    this.state.isPlaying = isPlaying
  }

  // Update current time
  updateCurrentTime(time: number): void {
    this.state.currentTime = time
  }

  // Update duration
  updateDuration(duration: number): void {
    this.state.duration = duration
  }

  // Set volume
  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume))
  }

  // Toggle mute
  toggleMute(): boolean {
    this.state.isMuted = !this.state.isMuted
    return this.state.isMuted
  }

  // Toggle shuffle
  toggleShuffle(): boolean {
    this.state.isShuffled = !this.state.isShuffled
    if (this.state.isShuffled) {
      this.shufflePlaylist()
    } else {
      this.restorePlaylistOrder()
    }
    return this.state.isShuffled
  }

  // Set repeat mode
  setRepeatMode(mode: 'none' | 'one' | 'all'): void {
    this.state.repeatMode = mode
  }

  // Get next song
  getNextSong(): Song | null {
    if (this.state.playlist.length === 0) return null
    
    const currentIndex = this.state.currentSong 
      ? this.state.playlist.findIndex(song => song.id === this.state.currentSong!.id)
      : -1
    
    if (currentIndex === -1 || currentIndex === this.state.playlist.length - 1) {
      return this.state.repeatMode === 'all' ? this.state.playlist[0] : null
    }
    
    return this.state.playlist[currentIndex + 1]
  }

  // Get previous song
  getPreviousSong(): Song | null {
    if (this.state.playlist.length === 0) return null
    
    const currentIndex = this.state.currentSong 
      ? this.state.playlist.findIndex(song => song.id === this.state.currentSong!.id)
      : -1
    
    if (currentIndex <= 0) {
      return this.state.repeatMode === 'all' ? this.state.playlist[this.state.playlist.length - 1] : null
    }
    
    return this.state.playlist[currentIndex - 1]
  }

  // Set playlist
  setPlaylist(songs: Song[]): void {
    this.state.playlist = [...songs]
  }

  // Add song to playlist
  addToPlaylist(song: Song): void {
    if (!this.state.playlist.find(s => s.id === song.id)) {
      this.state.playlist.push(song)
    }
  }

  // Remove song from playlist
  removeFromPlaylist(songId: string): void {
    this.state.playlist = this.state.playlist.filter(song => song.id !== songId)
  }

  // Shuffle playlist
  private shufflePlaylist(): void {
    const shuffled = [...this.state.playlist].sort(() => Math.random() - 0.5)
    this.state.playlist = shuffled
  }

  // Restore playlist order
  private restorePlaylistOrder(): void {
    // In a real implementation, you'd store the original order
    // For now, we'll just reload from the service
    this.state.playlist = this.getSampleSongs()
  }

  // Add to history
  private addToHistory(song: Song): void {
    // Remove if already exists
    this.state.history = this.state.history.filter(s => s.id !== song.id)
    // Add to beginning
    this.state.history.unshift(song)
    // Keep only last 50 songs
    if (this.state.history.length > 50) {
      this.state.history = this.state.history.slice(0, 50)
    }
  }

  // Toggle like for a song
  toggleLike(songId: string): void {
    const song = this.state.playlist.find(s => s.id === songId)
    if (song) {
      song.isLiked = !song.isLiked
    }
    
    if (this.state.currentSong?.id === songId) {
      this.state.currentSong.isLiked = !this.state.currentSong.isLiked
    }
  }

  // Search songs
  searchSongs(query: string): Song[] {
    const lowercaseQuery = query.toLowerCase()
    return this.state.playlist.filter(song => 
      song.title.toLowerCase().includes(lowercaseQuery) ||
      song.artist.toLowerCase().includes(lowercaseQuery) ||
      song.genre.toLowerCase().includes(lowercaseQuery) ||
      song.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  // Get songs by genre
  getSongsByGenre(genre: string): Song[] {
    return this.state.playlist.filter(song => 
      song.genre.toLowerCase() === genre.toLowerCase()
    )
  }

  // Get liked songs
  getLikedSongs(): Song[] {
    return this.state.playlist.filter(song => song.isLiked)
  }

  // Get recent songs (from history)
  getRecentSongs(limit: number = 10): Song[] {
    return this.state.history.slice(0, limit)
  }

  // Format time helper
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get audio file URL
  getAudioUrl(songId: string): string {
    // Handle special cases for different file formats
    if (songId === "ayce-intro") {
      return `/audio/ayce-intro.wav`
    }
    // Default to MP3 for other songs
    return `/audio/${songId}.mp3`
  }

  // Initialize with sample data
  initialize(): void {
    this.state.playlist = this.getSampleSongs()
    if (this.state.playlist.length > 0) {
      this.state.currentSong = this.state.playlist[0]
    }
  }
}

// Export singleton instance
export const jukeboxService = JukeboxService.getInstance()
