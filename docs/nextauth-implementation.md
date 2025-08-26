# 🔐 NextAuth.js Implementation Guide

## **Why NextAuth.js?**

- ✅ **Built for Next.js** - Perfect integration
- ✅ **Multiple providers** - Google, GitHub, Email, etc.
- ✅ **Database agnostic** - Works with any database
- ✅ **TypeScript support** - Full type safety
- ✅ **Active community** - Well-maintained
- ✅ **No vendor lock-in** - You own your data

## **Step 1: Install Dependencies**

```bash
npm install next-auth @prisma/client prisma bcryptjs
npm install -D @types/bcryptjs
```

## **Step 2: Set Up Database Schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  username      String?   @unique
  fullName      String?
  accountType   String?   @default("general")
  organization  String?
  role          String?
  enableMFA     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  activeProfile UserActiveProfile?
}

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  bio       String?
  location  String?
  website   String?
  socialLinks Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserActiveProfile {
  id                 String   @id @default(cuid())
  userId             String   @unique
  activeProfileType  String   @default("general")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

## **Step 3: Configure NextAuth.js**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || ''
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          accountType: user.accountType,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.accountType = user.accountType
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.accountType = token.accountType as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  }
})

export { handler as GET, handler as POST }
```

## **Step 4: Create Prisma Client**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## **Step 5: Create Auth Utilities**

Create `lib/auth.ts`:

```typescript
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  email: string
  password: string
  name?: string
  username?: string
  fullName?: string
  accountType?: string
  organization?: string
  role?: string
  enableMFA?: boolean
}) {
  const hashedPassword = await hashPassword(userData.password)

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      username: userData.username,
      fullName: userData.fullName,
      accountType: userData.accountType || 'general',
      organization: userData.organization,
      role: userData.role,
      enableMFA: userData.enableMFA || false,
      profile: {
        create: {}
      },
      activeProfile: {
        create: {
          activeProfileType: 'general'
        }
      }
    },
    include: {
      profile: true,
      activeProfile: true
    }
  })

  return user
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      activeProfile: true
    }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      activeProfile: true
    }
  })
}
```

## **Step 6: Update Environment Variables**

Update your `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tourify"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

## **Step 7: Create Signup API**

Create `app/api/auth/signup/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, username, fullName, accountType, organization, role, enableMFA } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Check if username is taken
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      })
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    // Create user
    const user = await createUser({
      email,
      password,
      name,
      username,
      fullName,
      accountType,
      organization,
      role,
      enableMFA
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## **Step 8: Update Your Signup Form**

Update your signup form to use the new API:

```typescript
// In your signup component
const handleSubmit = async () => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        username: formData.username,
        fullName: formData.fullName,
        accountType: formData.accountType,
        organization: formData.organization,
        role: formData.role,
        enableMFA: formData.enableMFA
      })
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Signup failed')
      return
    }

    setSuccess('Account created successfully! Please sign in.')
    
    // Redirect to signin page
    setTimeout(() => {
      router.push('/auth/signin')
    }, 2000)

  } catch (error) {
    console.error('Signup error:', error)
    setError('An unexpected error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

## **Step 9: Initialize Database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

## **Benefits of This Approach:**

1. ✅ **No vendor lock-in** - You own your data
2. ✅ **Full control** - Customize everything
3. ✅ **Multiple auth providers** - Email, Google, GitHub, etc.
4. ✅ **Type safety** - Full TypeScript support
5. ✅ **Scalable** - Works with any database
6. ✅ **Cost effective** - No per-user charges

## **Next Steps:**

1. **Choose your database** (PostgreSQL, MySQL, SQLite)
2. **Set up OAuth providers** (Google, GitHub, etc.)
3. **Customize the UI** to match your design
4. **Add email verification** if needed
5. **Implement MFA** for enhanced security

This solution gives you complete control over your authentication system without depending on Supabase.
