// Content moderation service with more realistic functionality
export interface ModeratedContent {
  original: string
  moderated: string
  isSafe: boolean
  flags: {
    profanity: boolean
    harassment: boolean
    hate: boolean
    selfHarm: boolean
    sexualContent: boolean
    violence: boolean
  }
  score: number
}

// Moderation history item
export interface ModerationHistoryItem {
  id: string
  content: string
  moderatedContent: string
  timestamp: string
  score: number
  status: "approved" | "rejected" | "flagged"
  flags: Record<string, boolean>
}

// Mock moderation history
let moderationHistory: ModerationHistoryItem[] = []

// Check content for moderation
export async function moderateContent(content: string): Promise<ModeratedContent> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would call a content moderation API
  // For demo purposes, we'll check for some basic keywords
  const lowerContent = content.toLowerCase()

  const flags = {
    profanity: checkProfanity(lowerContent),
    harassment: checkHarassment(lowerContent),
    hate: checkHate(lowerContent),
    selfHarm: checkSelfHarm(lowerContent),
    sexualContent: checkSexualContent(lowerContent),
    violence: checkViolence(lowerContent),
  }

  const flagCount = Object.values(flags).filter(Boolean).length
  const score = Math.max(0, 100 - flagCount * 20)
  const isSafe = score >= 80

  // Create moderated version by replacing flagged words with asterisks
  let moderated = content
  if (!isSafe) {
    moderated = replaceFlags(content)
  }

  // Add to moderation history
  addToHistory({
    id: Date.now().toString(),
    content,
    moderatedContent: moderated,
    timestamp: new Date().toISOString(),
    score,
    status: isSafe ? "approved" : "flagged",
    flags,
  })

  return {
    original: content,
    moderated,
    isSafe,
    flags,
    score,
  }
}

// Check for profanity
function checkProfanity(content: string): boolean {
  const profanityRegex = /\b(fuck|shit|ass|damn|bitch|cunt|dick|asshole|piss)\b/i
  return profanityRegex.test(content)
}

// Check for harassment
function checkHarassment(content: string): boolean {
  const harassmentRegex = /\b(stupid|idiot|loser|dumb|moron|retard|ugly|fat|pathetic)\b/i
  return harassmentRegex.test(content)
}

// Check for hate speech
function checkHate(content: string): boolean {
  const hateRegex = /\b(racist|nazi|bigot|homophobic|transphobic|sexist|misogynist)\b/i
  return hateRegex.test(content)
}

// Check for self-harm content
function checkSelfHarm(content: string): boolean {
  const selfHarmRegex = /\b(suicide|kill myself|cut myself|end my life|self-harm)\b/i
  return selfHarmRegex.test(content)
}

// Check for sexual content
function checkSexualContent(content: string): boolean {
  const sexualContentRegex = /\b(sex|porn|naked|nude|boobs|tits|cock|pussy|masturbate)\b/i
  return sexualContentRegex.test(content)
}

// Check for violence
function checkViolence(content: string): boolean {
  const violenceRegex = /\b(kill|murder|attack|beat up|stab|shoot|gun|weapon|bomb)\b/i
  return violenceRegex.test(content)
}

// Replace flagged content with asterisks
function replaceFlags(content: string): string {
  let moderated = content

  // Replace profanity
  moderated = moderated.replace(/\b(fuck|shit|ass|damn|bitch|cunt|dick|asshole|piss)\b/gi, (match) =>
    "*".repeat(match.length),
  )

  // Replace harassment
  moderated = moderated.replace(/\b(stupid|idiot|loser|dumb|moron|retard|ugly|fat|pathetic)\b/gi, (match) =>
    "*".repeat(match.length),
  )

  // Replace hate speech
  moderated = moderated.replace(/\b(racist|nazi|bigot|homophobic|transphobic|sexist|misogynist)\b/gi, (match) =>
    "*".repeat(match.length),
  )

  // Replace self-harm content
  moderated = moderated.replace(/\b(suicide|kill myself|cut myself|end my life|self-harm)\b/gi, (match) =>
    "*".repeat(match.length),
  )

  // Replace sexual content
  moderated = moderated.replace(/\b(sex|porn|naked|nude|boobs|tits|cock|pussy|masturbate)\b/gi, (match) =>
    "*".repeat(match.length),
  )

  // Replace violence
  moderated = moderated.replace(/\b(kill|murder|attack|beat up|stab|shoot|gun|weapon|bomb)\b/gi, (match) =>
    "*".repeat(match.length),
  )

  return moderated
}

// Add item to moderation history
function addToHistory(item: ModerationHistoryItem): void {
  moderationHistory.unshift(item)

  // Keep history limited to 100 items
  if (moderationHistory.length > 100) {
    moderationHistory = moderationHistory.slice(0, 100)
  }
}

// Get moderation history
export function getModerationHistory(): ModerationHistoryItem[] {
  return [...moderationHistory]
}

// Update moderation status
export function updateModerationStatus(id: string, status: "approved" | "rejected"): void {
  const index = moderationHistory.findIndex((item) => item.id === id)

  if (index !== -1) {
    moderationHistory[index] = {
      ...moderationHistory[index],
      status,
    }
  }
}

// Get moderation settings
export function getModerationSettings(): {
  automaticModeration: boolean
  profanityFilter: boolean
  notificationPreferences: boolean
} {
  // In a real app, these would be stored in a database
  return {
    automaticModeration: true,
    profanityFilter: true,
    notificationPreferences: true,
  }
}

// Update moderation settings
export function updateModerationSettings(settings: {
  automaticModeration?: boolean
  profanityFilter?: boolean
  notificationPreferences?: boolean
}): void {
  // In a real app, these would be stored in a database
  console.log("Updating moderation settings:", settings)
}
