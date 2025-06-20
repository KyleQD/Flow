"use client"

import { FileText, FileImage, FileArchive, FileSpreadsheet, File, FileCode } from "lucide-react"

export function getFileIcon(fileType: string) {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return (props: any) => <FileText {...props} className={`text-red-400 ${props.className || ""}`} />
    case "doc":
    case "docx":
      return (props: any) => <FileText {...props} className={`text-blue-400 ${props.className || ""}`} />
    case "xls":
    case "xlsx":
      return (props: any) => <FileSpreadsheet {...props} className={`text-green-400 ${props.className || ""}`} />
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return (props: any) => <FileImage {...props} className={`text-purple-400 ${props.className || ""}`} />
    case "zip":
    case "rar":
      return (props: any) => <FileArchive {...props} className={`text-yellow-400 ${props.className || ""}`} />
    case "html":
    case "css":
    case "js":
    case "json":
      return (props: any) => <FileCode {...props} className={`text-cyan-400 ${props.className || ""}`} />
    case "dwg":
      return (props: any) => <FileText {...props} className={`text-orange-400 ${props.className || ""}`} />
    default:
      return (props: any) => <File {...props} className={`text-gray-400 ${props.className || ""}`} />
  }
}

export { FileText, FileImage, FileArchive, FileSpreadsheet, File, FileCode as FileIcon }
