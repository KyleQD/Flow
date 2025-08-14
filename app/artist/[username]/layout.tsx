import { ReactNode } from 'react'

interface ArtistPublicLayoutProps {
  children: ReactNode
}

export default function ArtistPublicLayout({ children }: ArtistPublicLayoutProps) {
  // This layout provides a clean, public view without the artist dashboard sidebar
  // The PublicProfileLayout component now handles the styling
  return <>{children}</>
}
