# Streamlined Onboarding Flow

## Overview

The new streamlined onboarding flow is designed to get users into the Tourify platform as quickly as possible, then allow them to create sub-accounts (artist, venue, etc.) from their dashboard after email confirmation. This approach provides a much better user experience by reducing friction during signup.

## 🚀 **New User Journey**

### **Phase 1: Quick Signup**
1. **User visits `/onboarding`** - Gets the quick signup flow
2. **Minimal information required**:
   - Full name
   - Email address
   - Password
   - Terms acceptance
3. **Account created immediately** - User gets access to basic platform features
4. **Email verification sent** - User receives confirmation email

### **Phase 2: Email Confirmation**
1. **User clicks email link** - Verifies their account
2. **Redirected to dashboard** - With welcome message (`?welcome=true`)
3. **Welcome onboarding modal** - Shows profile creation options

### **Phase 3: Profile Creation (Optional)**
1. **User can create sub-accounts** from dashboard:
   - Artist profile
   - Venue profile
   - Staff profile (if invited)
2. **Each profile type** has its own onboarding flow
3. **Users can create multiple profiles** under their primary account

## 📋 **Flow Types**

### **1. Quick Signup Flow** (`/onboarding`)
- **Purpose**: New user account creation
- **Components**: `QuickSignupOnboarding`
- **Steps**:
  1. Welcome screen
  2. Account creation form
  3. Success confirmation

### **2. Artist Profile Creation** (`/onboarding?type=artist`)
- **Purpose**: Create artist sub-account
- **Components**: `ArtistVenueOnboarding` with `accountType="artist"`
- **Steps**:
  1. Welcome to artist profile creation
  2. Artist-specific form fields
  3. Profile creation success

### **3. Venue Profile Creation** (`/onboarding?type=venue`)
- **Purpose**: Create venue sub-account
- **Components**: `ArtistVenueOnboarding` with `accountType="venue"`
- **Steps**:
  1. Welcome to venue profile creation
  2. Venue-specific form fields
  3. Profile creation success

### **4. Staff Onboarding** (`/onboarding?token=xxx`)
- **Purpose**: Staff member onboarding with invitation token
- **Components**: `StaffOnboarding`
- **Steps**:
  1. Token validation
  2. Staff information collection
  3. Account activation

### **5. Invitation Onboarding** (`/onboarding?invitation=xxx`)
- **Purpose**: Account creation for invited users
- **Components**: `InvitationOnboarding`
- **Steps**:
  1. Invitation validation
  2. Account creation
  3. Role assignment

## 🎯 **Key Benefits**

### **For Users**
- **Faster signup** - Get into the platform in seconds
- **No commitment** - Can explore before creating profiles
- **Flexible** - Create profiles when ready
- **Multiple identities** - One account, multiple profiles

### **For Platform**
- **Higher conversion** - Lower barrier to entry
- **Better engagement** - Users can explore immediately
- **Reduced abandonment** - No complex upfront forms
- **Scalable** - Easy to add new profile types

## 🔧 **Technical Implementation**

### **Unified Onboarding Router**
```typescript
// app/onboarding/page.tsx
export default function OnboardingRouter() {
  // Determines flow type based on URL parameters
  const type = searchParams.get('type')
  const token = searchParams.get('token')
  const invitation = searchParams.get('invitation')
  
  // Routes to appropriate component
  switch (onboardingType) {
    case 'artist': return <ArtistVenueOnboarding accountType="artist" />
    case 'venue': return <ArtistVenueOnboarding accountType="venue" />
    case 'staff': return <StaffOnboarding />
    case 'invitation': return <InvitationOnboarding />
    default: return <QuickSignupOnboarding />
  }
}
```

### **Quick Signup Component**
```typescript
// components/onboarding/quick-signup-onboarding.tsx
export default function QuickSignupOnboarding() {
  const handleSubmit = async () => {
    // Create account with minimal data
    const result = await signUp(
      formData.email,
      formData.password,
      { full_name: formData.fullName }
    )
    
    // Redirect to success step
    setCurrentStep(3)
  }
}
```

### **Welcome Dashboard Modal**
```typescript
// components/dashboard/welcome-onboarding.tsx
export default function WelcomeOnboarding() {
  const handleCreateProfile = (type: 'artist' | 'venue') => {
    router.push(`/onboarding?type=${type}`)
  }
  
  // Shows profile creation options
  return (
    <div className="modal">
      <Card>Create Artist Profile</Card>
      <Card>Create Venue Profile</Card>
    </div>
  )
}
```

## 📊 **URL Structure**

### **Signup Flows**
- `/onboarding` - Quick signup (default)
- `/onboarding?type=artist` - Artist profile creation
- `/onboarding?type=venue` - Venue profile creation
- `/onboarding?token=xxx` - Staff onboarding
- `/onboarding?invitation=xxx` - Invitation onboarding

### **Dashboard Redirects**
- `/dashboard?welcome=true` - After email verification
- `/dashboard?profile_created=true` - After profile creation

## 🎨 **User Experience**

### **Quick Signup Process**
1. **Welcome Screen** - Engaging introduction with benefits
2. **Simple Form** - Only essential fields required
3. **Success Screen** - Clear next steps and email verification

### **Dashboard Welcome**
1. **Modal Overlay** - Non-intrusive welcome message
2. **Profile Options** - Clear choices for next steps
3. **Skip Option** - Users can dismiss and explore

### **Profile Creation**
1. **Contextual Welcome** - Specific to profile type
2. **Template-Based Forms** - Dynamic fields based on type
3. **Success Feedback** - Clear confirmation and next steps

## 🔄 **State Management**

### **User Authentication**
- Primary account created during quick signup
- Email verification required for full access
- Session management handled by Supabase Auth

### **Profile Tracking**
- User can have multiple profiles under one account
- Each profile type tracked separately
- Profile completion status stored in database

### **Onboarding Progress**
- Quick signup completion tracked
- Profile creation progress tracked
- Welcome modal shown based on URL parameters

## 🛡️ **Security & Validation**

### **Account Creation**
- Email validation and uniqueness check
- Password strength requirements
- Terms and conditions acceptance

### **Profile Creation**
- User must be authenticated
- Profile type validation
- Required field validation

### **Token-Based Flows**
- Secure token validation
- Expiration handling
- Role assignment verification

## 📈 **Analytics & Tracking**

### **Conversion Metrics**
- Signup completion rate
- Email verification rate
- Profile creation rate
- Time to first profile

### **User Behavior**
- Profile type preferences
- Drop-off points
- Feature adoption after signup

### **Performance**
- Page load times
- Form completion times
- Error rates

## 🚀 **Future Enhancements**

### **Planned Features**
1. **Social Signup** - Google, Facebook, Apple integration
2. **Progressive Profiling** - Collect more data over time
3. **A/B Testing** - Optimize conversion rates
4. **Onboarding Analytics** - Detailed user journey tracking

### **Profile Types**
1. **Promoter Profile** - Event promotion and management
2. **Manager Profile** - Artist and venue management
3. **Vendor Profile** - Equipment and service providers
4. **Fan Profile** - Music discovery and engagement

## 📞 **Support & Documentation**

### **User Guides**
- Quick start guide for new users
- Profile creation tutorials
- Platform feature overview

### **Developer Documentation**
- API endpoints for profile management
- Component usage examples
- Customization guidelines

### **Troubleshooting**
- Common signup issues
- Email verification problems
- Profile creation errors

## 🎉 **Conclusion**

The streamlined onboarding flow represents a significant improvement to the user experience by:

1. **Reducing friction** during initial signup
2. **Providing immediate value** through quick access
3. **Enabling flexible profile creation** based on user needs
4. **Supporting multiple identities** under one account
5. **Maintaining security** while improving usability

This approach aligns with modern UX best practices and should result in higher conversion rates and better user engagement.
