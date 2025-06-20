-- Create profiles table
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

-- Create staff_jobs table for job postings
CREATE TABLE IF NOT EXISTS staff_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    pay_rate TEXT,
    requirements TEXT[],
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create staff_applications table for job applications
CREATE TABLE IF NOT EXISTS staff_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES staff_jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_job_applicant UNIQUE (job_id, applicant_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES staff_jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_user_skill UNIQUE (user_id, skill)
);

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    url TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
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
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up RLS for staff_jobs
ALTER TABLE staff_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view staff jobs"
    ON staff_jobs FOR SELECT
    USING (true);

CREATE POLICY "Industry users can create jobs"
    ON staff_jobs FOR INSERT
    WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Job posters can update their jobs"
    ON staff_jobs FOR UPDATE
    USING (auth.uid() = posted_by);

-- Set up RLS for staff_applications
ALTER TABLE staff_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job posters can view applications for their jobs"
    ON staff_applications FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM staff_jobs
        WHERE staff_jobs.id = staff_applications.job_id
        AND staff_jobs.posted_by = auth.uid()
    ));

CREATE POLICY "Applicants can view their own applications"
    ON staff_applications FOR SELECT
    USING (auth.uid() = applicant_id);

CREATE POLICY "Industry users can create applications"
    ON staff_applications FOR INSERT
    WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Job posters can update application status"
    ON staff_applications FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM staff_jobs
        WHERE staff_jobs.id = staff_applications.job_id
        AND staff_jobs.posted_by = auth.uid()
    ));

-- Set up RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Set up RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Set up RLS for user_skills
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skills"
    ON user_skills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills"
    ON user_skills FOR ALL
    USING (auth.uid() = user_id);

-- Set up RLS for portfolio_items
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own portfolio items"
    ON portfolio_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own portfolio items"
    ON portfolio_items FOR ALL
    USING (auth.uid() = user_id); 