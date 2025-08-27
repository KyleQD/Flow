# Unified Onboarding System Implementation Guide

## Overview

This guide documents the implementation of the unified onboarding system for the Tourify platform. The system consolidates multiple conflicting onboarding flows into a single, maintainable solution that provides a consistent user experience across all user types.

## Architecture

### Core Components

1. **Unified Onboarding Router** (`app/onboarding/page.tsx`)
   - Single entry point for all onboarding flows
   - Determines flow type based on URL parameters and user context
   - Routes to appropriate onboarding component

2. **Onboarding Components**
   - `components/onboarding/artist-venue-onboarding.tsx` - Artist and venue account creation
   - `components/onboarding/staff-onboarding.tsx` - Staff onboarding with tokens
   - `components/onboarding/invitation-onboarding.tsx` - Invitation-based onboarding

3. **Unified Onboarding Service** (`lib/services/unified-onboarding.service.ts`)
   - Centralized service for all onboarding operations
   - Database abstraction layer
   - Template management
   - Flow tracking and statistics

4. **Database Schema** (`migrations/0004_unified_onboarding_schema.sql`)
   - Unified `onboarding_flows` table
   - `onboarding_templates` table for configurable forms
   - Row Level Security (RLS) policies
   - Automatic triggers for new user onboarding

5. **API Endpoints**
   - `/api/onboarding/unified` - RESTful API for onboarding operations
   - Supports CRUD operations for flows and templates
   - Validation and error handling

## Database Schema

### Onboarding Flows Table

```sql
CREATE TABLE onboarding_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('artist', 'venue', 'staff', 'invitation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  template_id UUID,
  responses JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, flow_type)
);
```

### Onboarding Templates Table

```sql
CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('artist', 'venue', 'staff', 'invitation')),
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Flow Types

### 1. Artist Onboarding
- **Purpose**: New artist account creation
- **Fields**: Artist name, bio, genres, social links
- **Template**: "Artist Profile Setup"

### 2. Venue Onboarding
- **Purpose**: New venue account creation
- **Fields**: Venue name, description, address, capacity, venue types
- **Template**: "Venue Profile Setup"

### 3. Staff Onboarding
- **Purpose**: Staff member onboarding with invitation tokens
- **Fields**: Full name, phone, emergency contact, experience, availability
- **Template**: "Staff Onboarding"

### 4. Invitation Onboarding
- **Purpose**: Account creation for invited users
- **Fields**: Email, password, full name, phone
- **Template**: "Invitation Onboarding"

## Implementation Details

### Template-Based Forms

The system uses JSON-based templates to define form fields dynamically:

```json
{
  "id": "artist_name",
  "type": "text",
  "label": "Artist Name",
  "placeholder": "Enter your artist or stage name",
  "required": true,
  "description": "Your artist or stage name as it appears on your music"
}
```

Supported field types:
- `text` - Single line text input
- `textarea` - Multi-line text input
- `number` - Numeric input
- `multiselect` - Checkbox group with options
- `email` - Email input with validation
- `password` - Password input

### Flow Management

Each user can have one onboarding flow per flow type. The system automatically:

1. Creates a default flow when a new user signs up
2. Tracks progress through the onboarding process
3. Stores user responses in JSONB format
4. Provides completion status and timestamps

### API Endpoints

#### GET `/api/onboarding/unified?flow_type=artist&user_id=123`
Retrieve a user's onboarding flow

#### POST `/api/onboarding/unified`
Create or update onboarding flows with actions:
- `create_flow` - Create new onboarding flow
- `update_flow` - Update existing flow
- `complete_flow` - Mark flow as completed
- `get_or_create_flow` - Get existing or create new flow

## Usage Examples

### Creating a New Onboarding Flow

```typescript
import { UnifiedOnboardingService } from '@/lib/services/unified-onboarding.service'

// Create artist onboarding flow
const flow = await UnifiedOnboardingService.createOnboardingFlow({
  user_id: 'user-123',
  flow_type: 'artist',
  template_id: 'template-456',
  metadata: { source: 'signup' }
})
```

### Updating Onboarding Progress

```typescript
// Update flow with user responses
await UnifiedOnboardingService.updateOnboardingFlow({
  id: 'flow-789',
  status: 'in_progress',
  responses: {
    artist_name: 'John Doe',
    bio: 'Independent musician',
    genres: ['Rock', 'Pop']
  }
})
```

### Completing Onboarding

```typescript
// Complete the onboarding flow
await UnifiedOnboardingService.completeOnboardingFlow(
  'flow-789',
  {
    artist_name: 'John Doe',
    bio: 'Independent musician',
    genres: ['Rock', 'Pop'],
    instagram: '@johndoe',
    spotify: 'https://spotify.com/artist/johndoe'
  }
)
```

### Checking Onboarding Status

```typescript
// Check if user has completed onboarding
const hasCompleted = await UnifiedOnboardingService.hasCompletedOnboarding(
  'user-123',
  'artist'
)
```

## Admin Management

### Onboarding Statistics

The system provides comprehensive analytics:

```typescript
const stats = await UnifiedOnboardingService.getOnboardingStats()
// Returns:
// {
//   total_flows: 150,
//   completed_flows: 120,
//   pending_flows: 20,
//   in_progress_flows: 8,
//   failed_flows: 2,
//   flows_by_type: {
//     artist: 80,
//     venue: 45,
//     staff: 20,
//     invitation: 5
//   }
// }
```

### Template Management

Admins can create and manage onboarding templates:

```typescript
// Get template by flow type
const template = await UnifiedOnboardingService.getTemplateByFlowType('artist')

// Get template by ID
const template = await UnifiedOnboardingService.getTemplateById('template-123')
```

## Security Features

### Row Level Security (RLS)

The database implements RLS policies to ensure data security:

- Users can only access their own onboarding flows
- Admin users can view all flows
- Templates are read-only for regular users
- Only admins can manage templates

### Validation

All inputs are validated using Zod schemas:

```typescript
const createFlowSchema = z.object({
  flow_type: z.enum(['artist', 'venue', 'staff', 'invitation']),
  template_id: z.string().optional(),
  metadata: z.record(z.any()).optional()
})
```

## Migration Strategy

### From Legacy System

1. **Database Migration**: Run `0004_unified_onboarding_schema.sql`
2. **Data Migration**: Migrate existing onboarding data to new schema
3. **Component Updates**: Replace old onboarding components with new unified ones
4. **URL Updates**: Update all onboarding redirects to use new unified router
5. **Testing**: Verify all onboarding flows work correctly

### Backward Compatibility

The system maintains backward compatibility by:
- Supporting existing URL patterns
- Preserving user data during migration
- Providing fallback mechanisms for legacy flows

## Testing

### Unit Tests

```typescript
// Test template validation
const template = await UnifiedOnboardingService.getTemplateByFlowType('artist')
expect(template).toBeDefined()
expect(template.fields).toHaveLength(5)

// Test flow creation
const flow = await UnifiedOnboardingService.createOnboardingFlow({
  user_id: 'test-user',
  flow_type: 'artist'
})
expect(flow.status).toBe('pending')
```

### Integration Tests

```typescript
// Test complete onboarding flow
const flow = await UnifiedOnboardingService.getOrCreateOnboardingFlow(
  'test-user',
  'artist'
)

await UnifiedOnboardingService.updateOnboardingFlow({
  id: flow.id,
  status: 'in_progress',
  responses: { artist_name: 'Test Artist' }
})

await UnifiedOnboardingService.completeOnboardingFlow(flow.id, {
  artist_name: 'Test Artist',
  bio: 'Test bio'
})

const completed = await UnifiedOnboardingService.hasCompletedOnboarding(
  'test-user',
  'artist'
)
expect(completed).toBe(true)
```

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns
- JSONB for flexible field storage
- Efficient queries with proper joins

### Caching Strategy

- Template caching for frequently accessed templates
- User flow caching to reduce database queries
- Statistics caching for admin dashboard

### Bundle Size

- Dynamic imports for onboarding components
- Tree shaking for unused template fields
- Optimized form rendering

## Monitoring and Analytics

### Key Metrics

- Onboarding completion rates
- Time to complete onboarding
- Drop-off points in the flow
- Template usage statistics
- Error rates and types

### Error Tracking

- Comprehensive error logging
- User-friendly error messages
- Automatic retry mechanisms
- Fallback options for failed flows

## Future Enhancements

### Planned Features

1. **Multi-step Forms**: Support for complex multi-step onboarding flows
2. **Conditional Fields**: Dynamic field visibility based on user responses
3. **A/B Testing**: Template variations for optimization
4. **Internationalization**: Multi-language support for templates
5. **Integration Hooks**: Webhooks for third-party integrations
6. **Analytics Dashboard**: Advanced analytics and reporting

### Scalability Considerations

- Horizontal scaling for high-traffic scenarios
- Database partitioning for large datasets
- CDN integration for template assets
- Microservice architecture for complex flows

## Troubleshooting

### Common Issues

1. **Template Not Found**
   - Verify template exists and is active
   - Check flow_type matches template type
   - Ensure user has access to template

2. **Flow Creation Failed**
   - Check user authentication
   - Verify required fields are provided
   - Check database constraints

3. **Validation Errors**
   - Review Zod schema definitions
   - Check field requirements
   - Verify data types match expectations

### Debug Tools

```typescript
// Enable debug logging
console.log('Onboarding Debug:', {
  user: user.id,
  flowType: 'artist',
  template: template?.id,
  responses: formData
})
```

## Conclusion

The unified onboarding system provides a robust, scalable solution for managing user onboarding across all user types. The template-based approach allows for easy customization and maintenance, while the comprehensive API and service layer ensures reliable operation and easy integration with the rest of the platform.

For questions or support, refer to the API documentation or contact the development team.
