# Development Guidelines for Tourify Platform

## Overview
This document outlines the coding standards, best practices, and common pitfalls to avoid when developing for the Tourify platform. Following these guidelines will help prevent build errors and maintain code quality.

## TypeScript Best Practices

### React Imports
**❌ Don't do this:**
```typescript
import type React from "react"
// Then later...
const endRef = React.useRef<HTMLDivElement>(null) // Error: React cannot be used as a value
```

**✅ Do this:**
```typescript
import React, { useState, useRef, useEffect } from "react"
// Or if you only need types:
import type { ReactNode } from "react"
```

### Type Definitions
**❌ Don't do this:**
```typescript
// Missing type definitions
const [data, setData] = useState() // Implicit any
const handleClick = (e) => {} // Implicit any
```

**✅ Do this:**
```typescript
// Always define types
const [data, setData] = useState<DataType | null>(null)
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
```

### Null Safety
**❌ Don't do this:**
```typescript
const userName = user.fullName.split(" ") // user might be null
```

**✅ Do this:**
```typescript
const userName = user?.fullName?.split(" ") || []
// Or with fallback
const userName = user?.fullName?.split(" ") || ["User"]
```

## Interface Consistency

### Profile Data Interface
Always use the centralized interface from `lib/types.ts`:

```typescript
export interface ProfileData {
  id?: string
  profile: Profile | null
  artistProfile: ArtistProfile | null
  venueProfile: VenueProfile | null
  fullName?: string
  username?: string
  location?: string
  bio?: string
  theme?: string
  avatar?: string
  title?: string
  artistType?: string
  genre?: string
  experience: Array<{
    id: string
    title: string
    company: string
    description: string
    startDate: string
    endDate?: string
    current: boolean
  }>
  certifications: Array<{
    id: string
    title: string
    organization: string
    year: string
    url?: string
  }>
  gallery: Array<{
    id: string
    title: string
    description: string
    imageUrl: string
    order: number
  }>
  skills: string[]
}
```

### Event Data Interface
```typescript
export interface VenueEvent {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  venue: string
  isPublic: boolean
  capacity: number
  image?: string
  type: "performance" | "meeting" | "recording" | "media"
}
```

## Context Usage

### Profile Context
Always use the centralized profile context:

```typescript
import { useProfile } from "@/context/venue/profile-context"

// Available methods:
const {
  profile,
  loading,
  updateProfile,
  addExperience,
  updateExperience,
  removeExperience,
  addCertification,
  updateCertification,
  removeCertification,
  addSkill,
  removeSkill,
  toggleTheme,
  searchSkills,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  exportProfile,
  importProfile,
  createEPK,
  upgradeToPremiumEPK,
  generateTickets,
  promotePaidContent,
  postJob,
  createGroup,
  toggleConnection
} = useProfile()
```

### Social Context
```typescript
import { useSocial } from "@/context/venue/social-context"

// Available methods:
const {
  users,
  conversations,
  messages,
  notifications,
  posts,
  events,
  currentUser,
  sendMessage,
  markConversationAsRead,
  markNotificationAsRead,
  likePost,
  unlikePost,
  commentOnPost,
  sharePost,
  followUser,
  unfollowUser,
  joinEvent,
  leaveEvent,
  createPost,
  createEvent
} = useSocial()
```

## Common Pitfalls to Avoid

### 1. Import Path Issues
**❌ Don't do this:**
```typescript
import { useAuth } from "@/context/auth-context" // Wrong path
import type { Toast } from "@/hooks/use-toast" // Type doesn't exist
```

**✅ Do this:**
```typescript
import { useAuth } from "@/contexts/auth-context" // Correct path
import type { ToasterToast } from "@/hooks/use-toast" // Correct type
```

### 2. Type Mismatches
**❌ Don't do this:**
```typescript
// Using Supabase User where custom User is expected
const currentUser: User = authUser // Type mismatch
```

**✅ Do this:**
```typescript
// Convert Supabase user to custom User type
const currentUserCustom = currentUser ? {
  id: currentUser.id,
  username: currentUser.email?.split('@')[0] || currentUser.id,
  fullName: currentUser.user_metadata?.full_name || 'User',
  avatar: currentUser.user_metadata?.avatar_url,
  bio: currentUser.user_metadata?.bio,
  location: currentUser.user_metadata?.location,
  isOnline: true,
  lastSeen: new Date().toISOString(),
} : null
```

### 3. Missing Properties
**❌ Don't do this:**
```typescript
const newExperience = {
  title: "",
  company: "",
  period: "", // Wrong property name
  description: "",
}
```

**✅ Do this:**
```typescript
const newExperience = {
  title: "",
  company: "",
  startDate: "", // Correct property name
  endDate: "",
  description: "",
  current: false,
}
```

### 4. Array vs Number Types
**❌ Don't do this:**
```typescript
const post = {
  likes: [], // Wrong type - should be number
  comments: [], // Wrong type - should be number
}
```

**✅ Do this:**
```typescript
const post = {
  likes: 0, // Correct type
  comments: 0, // Correct type
}
```

## File Structure Guidelines

### Context Files
- Place in `context/venue/` directory
- Export both provider and hook
- Use proper TypeScript interfaces
- Include all required methods in context value

### Type Definitions
- Centralize in `lib/types.ts`
- Export all interfaces and types
- Keep consistent naming conventions
- Document complex types

### Mock Data
- Create in `lib/mock-*.ts` files
- Match interface definitions exactly
- Use realistic but safe data
- Export as named constants

## Build Process

### Pre-commit Checklist
1. Run `npm run build` locally
2. Fix all TypeScript errors
3. Ensure all imports are correct
4. Verify context providers are complete
5. Check for null safety issues

### Common Build Errors and Solutions

#### "React cannot be used as a value"
**Solution:** Change `import type React` to `import React`

#### "Property does not exist on type"
**Solution:** Check interface definition and use correct property names

#### "Cannot find module"
**Solution:** Verify import path and ensure file exists

#### "Type is not assignable"
**Solution:** Check interface compatibility and fix type mismatches

#### "Object is possibly null"
**Solution:** Add null checks with optional chaining (`?.`) or nullish coalescing (`??`)

## Testing Guidelines

### Unit Tests
- Test utility functions
- Test custom hooks
- Test context providers
- Mock external dependencies

### Integration Tests
- Test component interactions
- Test context integration
- Test API calls
- Test error handling

### Build Tests
- Run `npm run build` before committing
- Fix all TypeScript errors
- Ensure no runtime errors
- Verify all imports work

## Performance Considerations

### Context Optimization
- Use `useMemo` for context values
- Avoid unnecessary re-renders
- Split large contexts into smaller ones
- Use proper dependency arrays

### Bundle Size
- Use dynamic imports for large components
- Lazy load non-critical features
- Optimize images and assets
- Monitor bundle size regularly

## Security Guidelines

### Environment Variables
- Never commit API keys
- Use `.env.local` for local development
- Validate environment variables at runtime
- Use proper error handling

### Data Validation
- Validate all user inputs
- Sanitize data before storage
- Use TypeScript for type safety
- Implement proper error boundaries

## Documentation

### Code Comments
- Document complex logic
- Explain business rules
- Comment on workarounds
- Keep comments up to date

### README Files
- Update setup instructions
- Document new features
- Include troubleshooting guides
- Maintain API documentation

## Conclusion

Following these guidelines will help prevent build errors, maintain code quality, and ensure a smooth development experience. Always prioritize type safety, null checking, and consistent interfaces. When in doubt, refer to existing working code as examples.

Remember: **TypeScript is your friend** - use it to catch errors early and maintain code quality.
