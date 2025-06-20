"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, CheckCircle, Database, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SQLMigrationsPage() {
  const [copied, setCopied] = useState(false)
  
  const sql = `-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT,
    purpose TEXT,
    on_tour BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_user_onboarding UNIQUE (user_id)
);

-- Set up Row Level Security (RLS)
-- Secure the tables with RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Create policies for onboarding
CREATE POLICY "Users can view their own onboarding" 
    ON onboarding FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding" 
    ON onboarding FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding" 
    ON onboarding FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/migrations" className="flex items-center text-sm text-slate-400 hover:text-white mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Migrations
        </Link>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-purple-500" />
              <CardTitle className="text-xl text-slate-200">SQL Migration Script</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Run this SQL in the Supabase dashboard SQL Editor
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="text-sm text-slate-300 mb-4">
              <p>
                Due to security restrictions, we can't automatically create these database tables from the client.
                Please copy and run this SQL script in your Supabase dashboard:
              </p>
              <ol className="list-decimal pl-6 mt-3 space-y-1">
                <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Supabase Dashboard</a></li>
                <li>Select your project</li>
                <li>Open the SQL Editor (under "Table Editor")</li>
                <li>Create a new query</li>
                <li>Paste the SQL below</li>
                <li>Click "Run" to execute the SQL</li>
              </ol>
            </div>
            
            <div className="relative mt-6">
              <pre className="bg-slate-950 p-4 rounded-md overflow-x-auto text-slate-300 text-sm font-mono">
                {sql}
              </pre>
              <Button 
                onClick={copyToClipboard}
                size="sm"
                className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700"
                variant="outline"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="text-sm text-slate-400">
              After running this SQL, return to the <Link href="/migrations" className="text-purple-400 hover:underline">migrations page</Link> to verify your tables are set up correctly.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 