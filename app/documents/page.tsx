import { DocumentsManagement } from "@/components/documents/documents-management"

// Prevent pre-rendering since this page requires providers
export const dynamic = 'force-dynamic'

export default function DocumentsPage() {
  return <DocumentsManagement />
}
