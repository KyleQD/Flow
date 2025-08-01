# Event Planner System Documentation

## Overview

The Event Planner is a comprehensive 7-step workflow system designed to guide users through the complete event planning process. It provides a structured approach to event creation, from initial concept to final publication.

## Architecture

### Core Components

- **Main Page**: `app/admin/dashboard/events/planner/page.tsx`
- **Supporting Components**: `components/admin/event-planner-support.tsx`
- **API Routes**: `app/api/events/planner/`
- **Database Schema**: `supabase/migrations/20250125000000_event_planner_system.sql`

### Data Structure

The event planner uses a comprehensive data structure that tracks all aspects of event planning:

```typescript
interface EventPlannerData {
  // Step 1: Event Initiation
  name: string
  description: string
  template: string
  eventType: string
  primaryContact: string
  estimatedBudget: number
  privacy: "public" | "private" | "invite-only"
  
  // Step 2: Venue & Schedule
  venues: Array<{
    id: string
    name: string
    address: string
    capacity: number
    selectedDate: string
    selectedTime: string
  }>
  schedule: Array<{
    id: string
    title: string
    startTime: string
    endTime: string
    venue: string
    type: string
  }>
  
  // Step 3: Ticketing & Registration
  ticketTypes: Array<{
    id: string
    name: string
    price: number
    quantity: number
    description: string
    maxPerCustomer: number
  }>
  registrationForms: Array<{
    field: string
    type: string
    required: boolean
    options?: string[]
  }>
  promoCodes: Array<{
    code: string
    discount: number
    type: "percentage" | "fixed"
    maxUses: number
  }>
  
  // Step 4: Team & Permissions
  teamMembers: Array<{
    id: string
    name: string
    email: string
    role: string
    permissions: string[]
    status: "pending" | "accepted" | "declined"
  }>
  
  // Step 5: Marketing & Promotion
  campaigns: Array<{
    id: string
    name: string
    type: string
    status: string
    budget: number
    platform: string
    startDate: string
    endDate: string
    targetAudience: string
    goals: string
    content: Array<{
      id: string
      title: string
      type: string
      description: string
      scheduledDate: string
      status: string
      createdAt: string
    }>
    metrics: {
      reach: number
      engagement: number
      clicks: number
      conversions: number
    }
  }>
  
  // Step 6: Financials
  budget: {
    categories: Array<{
      name: string
      allocated: number
      spent: number
    }>
    totalBudget: number
    expectedRevenue: number
  }
  
  // Step 7: Review & Publish
  checklist: Array<{
    item: string
    completed: boolean
    required: boolean
  }>
  publishStatus: "draft" | "review" | "published"
}
```

## 7-Step Workflow

### Step 1: Event Initiation
**Purpose**: Define the foundation of your event

**Features**:
- Event templates (Concert Tour, Conference, Festival, Corporate Gala, Product Launch, Custom)
- Basic event details (name, description, type, contact)
- Privacy settings (public, private, invite-only)
- Budget estimation
- Template presets for quick setup

**Components**:
- Template selection cards
- Event details form
- Privacy settings
- Budget input

### Step 2: Venue & Schedule
**Purpose**: Choose venues and build event schedules

**Features**:
- Venue browser and selection
- Schedule building with timeline view
- Conflict detection
- Venue capacity management
- Multi-venue support

**Components**:
- VenueCard
- VenueBrowser
- ScheduleTimeline
- ScheduleItemForm

### Step 3: Ticketing & Registration
**Purpose**: Create ticket types and registration forms

**Features**:
- Multiple ticket types (General, VIP, Early Bird, etc.)
- Pricing tiers and quantity limits
- Custom registration fields
- Promo codes and discounts
- Capacity management

**Components**:
- TicketTypeCard
- CustomFieldCard
- Pricing calculator
- Registration form builder

### Step 4: Team & Permissions
**Purpose**: Manage team members and assign roles

**Features**:
- User search and invitation
- Role-based permissions
- Team member management
- Communication tools
- Status tracking

**Components**:
- TeamMemberCard
- User search interface
- Role assignment
- Permission mapping

### Step 5: Marketing & Promotion
**Purpose**: Create and manage marketing campaigns

**Features**:
- Campaign types (Social Media, Email, Paid Ads, Influencer)
- Content creation and scheduling
- Budget allocation
- Performance tracking
- Target audience definition

**Components**:
- CampaignCard
- CampaignFormModal
- ContentFormModal
- CampaignMetrics

### Step 6: Financials & Reporting
**Purpose**: Track budgets and financial performance

**Features**:
- Budget categories and tracking
- Expense management
- Revenue projections
- Financial dashboard
- Profit/loss analysis

**Components**:
- BudgetFormModal
- RevenueFormModal
- BudgetCategoryCard
- Financial charts

### Step 7: Review & Publish
**Purpose**: Final review and event publication

**Features**:
- Comprehensive checklist
- Event preview
- Status tracking
- Publication workflow
- Quality assurance

**Components**:
- EventPreviewModal
- ChecklistItem
- Status indicators
- Action buttons

## Key Features

### Progress Tracking
- Real-time completion percentage
- Step-by-step progress indicators
- Required field validation
- Visual progress bars

### Template System
- Pre-built event templates
- Customizable presets
- Quick-start options
- Template categories

### Conflict Detection
- Schedule conflict identification
- Venue availability checking
- Resource allocation validation
- Warning systems

### Integration
- User authentication
- Real-time collaboration
- API endpoints
- Database persistence

### UI/UX
- Responsive design
- Dark theme
- Smooth animations
- Intuitive navigation

## API Endpoints

### GET /api/events/planner
Retrieve event planner data for a user or specific planner

### POST /api/events/planner
Create new event planner data

### PUT /api/events/planner/[id]
Update existing event planner data

### POST /api/events/planner/publish
Publish an event from planner data

## Database Schema

### event_planner_data
Main table storing all event planner information

### event_templates
Predefined event templates with presets

### event_venues
Venue information and availability

### event_team_members
Team member assignments and roles

## Usage Examples

### Creating a New Event
1. Navigate to `/admin/dashboard/events/planner`
2. Select an event template or choose "Custom Event"
3. Fill in basic event details
4. Progress through each step
5. Review and publish

### Managing Team Members
1. Go to Step 4: Team & Permissions
2. Search for existing users
3. Assign roles and permissions
4. Send invitations
5. Track acceptance status

### Budget Management
1. Navigate to Step 6: Financials & Reporting
2. Set budget categories
3. Track expenses
4. Monitor revenue projections
5. Analyze profit/loss

## Best Practices

### Event Planning
- Start with a clear event concept
- Use appropriate templates for efficiency
- Plan venues and schedules early
- Set realistic budgets
- Build comprehensive teams

### User Experience
- Complete required fields first
- Use the preview feature before publishing
- Regularly save progress
- Review all steps before finalizing

### Technical Implementation
- Validate data at each step
- Handle errors gracefully
- Provide clear feedback
- Maintain data consistency

## Troubleshooting

### Common Issues
1. **Avatar Import Errors**: Clear cache and restart dev server
2. **Disk Space Issues**: Clean up .next/cache directory
3. **TypeScript Errors**: Check component imports and interfaces
4. **API Errors**: Verify authentication and database connections

### Performance Optimization
- Lazy load components
- Optimize database queries
- Use proper caching strategies
- Minimize bundle size

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Integration with external platforms
- Mobile app support
- AI-powered recommendations
- Advanced reporting tools

### Technical Improvements
- Real-time collaboration
- Offline support
- Advanced search capabilities
- Enhanced security features

## Support

For technical support or feature requests, please refer to the project documentation or contact the development team. 