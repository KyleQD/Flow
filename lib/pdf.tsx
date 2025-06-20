import { PDFDownloadLink } from "@react-pdf/renderer"
import { EPKDocument } from "@/components/epk/EPKDocument"
import React from "react"

interface EPKData {
  artistName: string
  bio: string
  genre: string
  location: string
  stats: {
    followers: number
    monthlyListeners: number
    totalStreams: number
    eventsPlayed: number
  }
  music: {
    title: string
    url: string
    releaseDate: string
    streams: number
  }[]
  photos: string[]
  press: {
    title: string
    url: string
    date: string
    outlet: string
  }[]
  contact: {
    email: string
    phone: string
    website: string
    bookingEmail: string
    managementEmail: string
  }
  social: {
    platform: string
    url: string
  }[]
  upcomingShows: {
    date: string
    venue: string
    location: string
    ticketUrl: string
  }[]
}

export const generateEPKPDF = (data: EPKData): React.ReactNode => {
  return (
    <PDFDownloadLink
      document={<EPKDocument data={data} />}
      fileName={`${data.artistName.toLowerCase().replace(/\s+/g, '-')}-epk.pdf`}
      style={{
        textDecoration: "none",
        padding: "10px 20px",
        color: "#4a90e2",
        backgroundColor: "white",
        border: "1px solid #4a90e2",
        borderRadius: "4px",
      }}
    >
      {({ loading }) => (loading ? "Generating PDF..." : "Download EPK")}
    </PDFDownloadLink>
  )
} 