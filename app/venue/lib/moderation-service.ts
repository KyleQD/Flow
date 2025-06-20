export interface ModeratedContent {
  id: string
  content: string
  status: 'approved' | 'rejected' | 'pending'
}

export interface ModerationHistoryItem {
  id: string
  content: string
  status: 'approved' | 'rejected' | 'pending'
  date: string
}

export function moderateContent(content: string): boolean {
  // Placeholder: always returns true (content is allowed)
  return true
}

export function getModerationHistory(): ModerationHistoryItem[] {
  return []
}

export function updateModerationStatus(id: string, status: 'approved' | 'rejected' | 'pending'): boolean {
  return true
}

export function getModerationSettings() {
  return {}
}

export function updateModerationSettings(settings: any) {
  return true
} 