# Flow Platform

The ultimate platform for artists, venues, and music industry professionals to connect, create, and tour.

## 🚀 Quick Setup for Seamless Login

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Optional: Social Authentication
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Database Setup

Run the complete database setup in your Supabase SQL Editor:

```sql
-- Copy and run the contents of complete_database_setup.sql
```

This will create:
- User profiles table with onboarding tracking
- Artist and venue profile tables
- Authentication triggers
- Row Level Security policies

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

## 🔐 Authentication Flow

### Current Implementation

The platform uses **Supabase Auth** as the primary authentication system with the following flow:

1. **Sign In/Sign Up** → `/auth/signin` or `/auth/signup`
2. **Email Verification** → Handled automatically by Supabase
3. **Onboarding Check** → Redirects to `/onboarding` if not completed
4. **Dashboard** → Main application at `/dashboard`

### Key Features

- ✅ Email/Password authentication
- ✅ Automatic session management
- ✅ Protected routes with middleware
- ✅ Onboarding flow for new users
- ✅ Multi-account support (Artist/Venue profiles)
- ✅ Real-time auth state updates

### Route Protection

- **Public Routes**: `/`, `/auth/*`, `/terms`, `/privacy`
- **Protected Routes**: `/dashboard`, `/profile`, `/events`, `/messages`, etc.
- **Auth Routes**: Redirect to dashboard if already authenticated

## 🏗️ Project Structure

```
├── app/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard
│   ├── onboarding/     # User onboarding flow
│   └── ...
├── contexts/
│   └── auth-context.tsx    # Unified auth context
├── lib/
│   └── supabase/           # Supabase client configs
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client  
│       └── middleware.ts   # Auth middleware
├── middleware.ts           # Route protection
└── complete_database_setup.sql
```

## 🚨 Important Notes

### Removed Conflicts
- ❌ Removed duplicate auth contexts
- ❌ Removed NextAuth (using Supabase Auth only)
- ❌ Cleaned up multiple Supabase client instances

### Current Status
- ✅ Unified authentication system
- ✅ Consistent session management
- ✅ Proper error handling
- ✅ Modern Next.js 15 compatibility

## 🔧 Development

### Running the Project

1. Ensure your Supabase project is set up
2. Copy environment variables
3. Run database migrations
4. Start the development server

### Authentication Testing

- Visit `/auth/signin` to test login
- Create a new account at `/auth/signup`
- Check the onboarding flow for new users
- Verify protected routes are working

## 📚 Documentation

For detailed implementation details, see:
- [Authentication Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [API Documentation](docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test authentication flows
5. Submit a pull request

---

**Ready to Connect. Create. Tour.** 🎵 