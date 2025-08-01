# Optimized Onboarding System

## Overview

The optimized onboarding system provides a comprehensive, template-driven approach to onboarding new hires with all the fields typically required for different roles. The system includes pre-built templates for common positions and allows for custom template creation.

## Key Features

### 🎯 **Comprehensive Templates**
- **Pre-built templates** for common roles (General Staff, Security, Bar Staff, Technical, Management)
- **Role-specific fields** with appropriate validation and requirements
- **Custom template creation** with drag-and-drop field management
- **Template inheritance** - specialized templates build upon general templates

### 📋 **Advanced Field Types**
- **Basic fields**: text, email, phone, date, number, checkbox
- **Complex fields**: address, emergency contact, bank info, tax info, ID documents
- **Multi-step forms**: select, multiselect, textarea, file upload
- **Validation**: pattern matching, min/max values, custom validation rules

### 🔄 **Complete Workflow**
1. **Admin creates/invites** → Selects appropriate template
2. **User receives invitation** → Completes comprehensive onboarding form
3. **Admin reviews** → Approves or rejects with notes
4. **Automatic team assignment** → Approved users added to venue teams

## Template Types

### 1. General Staff Onboarding
**Fields**: 16 total across 5 sections
- **Personal Information**: Name, email, phone, DOB, address, SSN
- **Emergency Contact**: Contact details and relationship
- **Employment Information**: Start date, availability, shift preference
- **Banking Information**: Direct deposit details
- **Required Documents**: Government ID, SSN card, direct deposit form
- **Agreements**: Handbook acknowledgment, background check consent

### 2. Security Staff Onboarding
**Fields**: 26 total (includes all General Staff fields + 10 security-specific)
- **Security Information**: License number, expiry, firearm permit, CPR certification
- **Experience**: Previous security experience, conflict resolution training
- **Additional Documents**: Security license, CPR certification, firearm permit

### 3. Bar Staff Onboarding
**Fields**: 25 total (includes all General Staff fields + 9 bar-specific)
- **Bar Information**: Alcohol server certification, food handler certification
- **Experience**: Bartending experience, wine knowledge, cocktail specialties
- **Additional Documents**: Alcohol server cert, food handler cert

### 4. Technical Staff Onboarding
**Fields**: 24 total (includes all General Staff fields + 8 technical-specific)
- **Technical Information**: Specialties, certifications, equipment experience
- **Software**: Proficiency in industry-standard software
- **Safety**: Safety training, height certification, forklift certification

### 5. Management Onboarding
**Fields**: 25 total (includes all General Staff fields + 9 management-specific)
- **Management Information**: Resume, management experience, team size
- **Leadership**: Budget experience, project management, conflict resolution
- **Additional Documents**: Resume, references, NDA agreement

## Field Types and Components

### Basic Field Types
```typescript
type FieldType = 
  | 'text' | 'email' | 'phone' | 'date' | 'select' 
  | 'multiselect' | 'textarea' | 'file' | 'checkbox' 
  | 'number' | 'address' | 'emergency_contact' 
  | 'bank_info' | 'tax_info' | 'id_document'
```

### Complex Field Components

#### Address Field
- Street address, unit/suite
- City, state, ZIP code
- Validation for required fields

#### Emergency Contact Field
- Full name, relationship
- Phone number, email
- Required for safety compliance

#### Bank Information Field
- Bank name, account type
- Routing number, account number
- Secure handling of sensitive data

#### Tax Information Field
- Social Security Number
- Filing status, dependents
- Tax compliance requirements

#### ID Document Field
- Document type selection
- Document number
- File upload for verification

## API Endpoints

### Template Management
```typescript
// Get all templates for a venue
GET /api/admin/onboarding/templates?venue_id={venueId}

// Create new template
POST /api/admin/onboarding/templates

// Update existing template
PUT /api/admin/onboarding/templates

// Delete template
DELETE /api/admin/onboarding/templates?id={templateId}

// Initialize default templates
POST /api/admin/onboarding/initialize-templates
```

### Candidate Management
```typescript
// Get candidates and stats
GET /api/admin/onboarding/candidates?venue_id={venueId}

// Add existing user
POST /api/admin/onboarding/add-existing-user

// Invite new user
POST /api/admin/onboarding/invite-new-user

// Review candidate
POST /api/admin/onboarding/review
```

### User Onboarding
```typescript
// Submit onboarding responses
POST /api/onboarding/submit
```

## Database Schema

### Onboarding Templates
```sql
CREATE TABLE staff_onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  name VARCHAR NOT NULL,
  description TEXT,
  department VARCHAR NOT NULL,
  position VARCHAR NOT NULL,
  employment_type VARCHAR NOT NULL,
  fields JSONB NOT NULL, -- Array of field definitions
  estimated_days INTEGER NOT NULL,
  required_documents TEXT[] NOT NULL,
  assignees TEXT[] NOT NULL,
  tags TEXT[] NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Onboarding Candidates
```sql
CREATE TABLE staff_onboarding_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id),
  user_id UUID REFERENCES profiles(id),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  position VARCHAR NOT NULL,
  department VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  stage VARCHAR NOT NULL DEFAULT 'invitation',
  employment_type VARCHAR NOT NULL,
  start_date DATE,
  salary DECIMAL,
  notes TEXT,
  template_id UUID REFERENCES staff_onboarding_templates(id),
  invitation_token VARCHAR,
  onboarding_responses JSONB,
  review_notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP,
  onboarding_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Examples

### Initialize Default Templates
```typescript
// Admin clicks "Initialize Defaults" button
const response = await fetch("/api/admin/onboarding/initialize-templates", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ venue_id: "venue-uuid" })
});

// Creates 5 comprehensive templates automatically
```

### Create Custom Template
```typescript
const customTemplate = {
  venue_id: "venue-uuid",
  name: "Custom Role Template",
  description: "Template for specialized role",
  department: "Special Operations",
  position: "Specialist",
  employment_type: "full_time",
  fields: [
    {
      id: "custom_field",
      type: "text",
      label: "Custom Field",
      required: true,
      order: 1,
      section: "Custom Information"
    }
  ],
  estimated_days: 5,
  required_documents: ["Custom Document"],
  assignees: [],
  tags: ["custom", "specialized"]
};
```

### Invite User with Template
```typescript
const invitation = {
  venue_id: "venue-uuid",
  email: "newhire@example.com",
  position: "Security Officer",
  department: "Security",
  employment_type: "full_time",
  onboarding_template_id: "security-template-uuid",
  message: "Welcome to our team!"
};
```

## Form Validation

### Field-Level Validation
```typescript
interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string; // Regex pattern
  custom?: string; // Custom validation rule
}
```

### Required Field Handling
- Visual indicators (red asterisks)
- Client-side validation
- Server-side validation
- Progress tracking

### File Upload Validation
- File type restrictions
- Size limits
- Secure storage
- Preview capabilities

## Security Features

### Data Protection
- **Encrypted storage** for sensitive information
- **Access controls** based on user roles
- **Audit trails** for all actions
- **Secure file uploads** with virus scanning

### Privacy Compliance
- **GDPR compliance** for EU users
- **Data retention policies**
- **Right to deletion**
- **Consent management**

## Integration Points

### Notification System
- Invitation notifications
- Progress updates
- Completion alerts
- Review requests

### Team Management
- Automatic team assignment
- Role-based permissions
- Department organization
- Access provisioning

### Document Management
- Secure file storage
- Document templates
- Digital signatures
- Compliance tracking

## Best Practices

### Template Design
1. **Start with general templates** and specialize
2. **Group related fields** into logical sections
3. **Use clear, descriptive labels**
4. **Provide helpful placeholder text**
5. **Include validation rules** where appropriate

### User Experience
1. **Progressive disclosure** - show relevant fields based on role
2. **Save progress** automatically
3. **Clear error messages** with actionable guidance
4. **Mobile-responsive** design
5. **Accessibility compliance**

### Admin Workflow
1. **Template selection** based on role requirements
2. **Bulk operations** for multiple candidates
3. **Review dashboard** with filtering and search
4. **Approval workflows** with delegation options
5. **Analytics and reporting** for process optimization

## Troubleshooting

### Common Issues

#### Template Not Loading
- Check venue_id parameter
- Verify template exists in database
- Check user permissions

#### Form Validation Errors
- Review field validation rules
- Check required field completion
- Verify file upload requirements

#### API Errors
- Check authentication status
- Verify request payload format
- Review server logs for details

### Performance Optimization
- **Lazy loading** for large forms
- **Caching** for template data
- **Optimized queries** for candidate lists
- **Background processing** for file uploads

## Future Enhancements

### Planned Features
- **Multi-language support** for international teams
- **Advanced workflow automation** with conditional logic
- **Integration with HR systems** (Workday, BambooHR)
- **Mobile app** for field workers
- **AI-powered form completion** assistance
- **Advanced analytics** and reporting
- **Bulk import/export** capabilities
- **Custom branding** and white-labeling

### Scalability Considerations
- **Microservices architecture** for high-volume deployments
- **Database sharding** for multi-tenant setups
- **CDN integration** for global file delivery
- **API rate limiting** and caching strategies
- **Horizontal scaling** for peak usage periods

## Support and Maintenance

### Monitoring
- **Error tracking** and alerting
- **Performance metrics** and dashboards
- **User activity** analytics
- **System health** checks

### Updates and Maintenance
- **Regular security updates**
- **Feature releases** and improvements
- **Database maintenance** and optimization
- **Backup and recovery** procedures

---

This optimized onboarding system provides a comprehensive, scalable solution for managing new hire onboarding with industry-standard templates and advanced field handling capabilities. 