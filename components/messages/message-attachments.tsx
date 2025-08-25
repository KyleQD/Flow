import type { Attachment } from "./types"
import { FileIcon, FileTextIcon, ImageIcon } from "lucide-react"

interface MessageAttachmentsProps {
  attachments: Attachment[]
}

export default function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-md bg-background/20 hover:bg-background/40 transition-colors"
        >
          <AttachmentIcon type={attachment.type} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{attachment.name}</div>
            <div className="text-xs opacity-70">{formatFileSize(Number(attachment.size))}</div>
          </div>
        </a>
      ))}
    </div>
  )
}

function AttachmentIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-blue-400" />
  } else if (type === "application/pdf") {
    return <FileTextIcon className="h-5 w-5 text-red-400" />
  } else {
    return <FileIcon className="h-5 w-5 text-gray-400" />
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}
