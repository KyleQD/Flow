-- Add new columns to user_skills for enhanced matching
ALTER TABLE user_skills
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certification_url TEXT,
ADD COLUMN IF NOT EXISTS last_used TIMESTAMPTZ;

-- Add new columns to portfolio_items for enhanced portfolio
ALTER TABLE portfolio_items
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_testimonial TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS external_links JSONB;

-- Create table for portfolio media
CREATE TABLE IF NOT EXISTS portfolio_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_item_id UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create table for user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_locations TEXT[],
    preferred_event_types TEXT[],
    availability JSONB,
    min_pay_rate DECIMAL,
    max_travel_distance INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Create table for job matching scores
CREATE TABLE IF NOT EXISTS job_matching_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES staff_jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_match_score DECIMAL,
    location_match_score DECIMAL,
    availability_match_score DECIMAL,
    experience_match_score DECIMAL,
    overall_score DECIMAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT unique_job_user_match UNIQUE (job_id, user_id)
);

-- Create table for user work history
CREATE TABLE IF NOT EXISTS work_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    description TEXT,
    skills_used TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create table for certifications
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create table for safety training
CREATE TABLE IF NOT EXISTS safety_training (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    training_type TEXT NOT NULL,
    completion_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ,
    provider TEXT,
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Set up RLS for new tables
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matching_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_training ENABLE ROW LEVEL SECURITY;

-- Create policies for portfolio_media
CREATE POLICY "Users can view their own portfolio media"
    ON portfolio_media FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM portfolio_items
        WHERE portfolio_items.id = portfolio_media.portfolio_item_id
        AND portfolio_items.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own portfolio media"
    ON portfolio_media FOR ALL
    USING (EXISTS (
        SELECT 1 FROM portfolio_items
        WHERE portfolio_items.id = portfolio_media.portfolio_item_id
        AND portfolio_items.user_id = auth.uid()
    ));

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- Create policies for job_matching_scores
CREATE POLICY "Users can view their own job matching scores"
    ON job_matching_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Job posters can view matching scores for their jobs"
    ON job_matching_scores FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM staff_jobs
        WHERE staff_jobs.id = job_matching_scores.job_id
        AND staff_jobs.posted_by = auth.uid()
    ));

-- Create policies for work_history
CREATE POLICY "Users can view their own work history"
    ON work_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own work history"
    ON work_history FOR ALL
    USING (auth.uid() = user_id);

-- Create policies for certifications
CREATE POLICY "Users can view their own certifications"
    ON certifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own certifications"
    ON certifications FOR ALL
    USING (auth.uid() = user_id);

-- Create policies for safety_training
CREATE POLICY "Users can view their own safety training"
    ON safety_training FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own safety training"
    ON safety_training FOR ALL
    USING (auth.uid() = user_id);

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON user_skills(category);
CREATE INDEX IF NOT EXISTS idx_user_skills_verified ON user_skills(verified);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_media_portfolio_item_id ON portfolio_media(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_work_history_user_id ON work_history(user_id);
CREATE INDEX IF NOT EXISTS idx_work_history_start_date ON work_history(start_date);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_issue_date ON certifications(issue_date);
CREATE INDEX IF NOT EXISTS idx_job_matching_scores_job_id ON job_matching_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_job_matching_scores_user_id ON job_matching_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matching_scores_overall_score ON job_matching_scores(overall_score);

-- Add materialized views for complex queries
CREATE MATERIALIZED VIEW IF NOT EXISTS user_skill_summary AS
SELECT 
    user_id,
    category,
    COUNT(*) as total_skills,
    COUNT(CASE WHEN verified = true THEN 1 END) as verified_skills,
    AVG(years_of_experience) as avg_experience
FROM user_skills
GROUP BY user_id, category;

CREATE MATERIALIZED VIEW IF NOT EXISTS portfolio_summary AS
SELECT 
    p.user_id,
    p.category,
    COUNT(*) as total_items,
    COUNT(CASE WHEN m.type = 'image' THEN 1 END) as total_images,
    COUNT(CASE WHEN m.type = 'video' THEN 1 END) as total_videos
FROM portfolio_items p
LEFT JOIN portfolio_media m ON p.id = m.portfolio_item_id
GROUP BY p.user_id, p.category;

-- Add function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_skill_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_summary;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views_trigger()
RETURNS trigger AS $$
BEGIN
    PERFORM refresh_materialized_views();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_skill_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_skills
FOR EACH STATEMENT EXECUTE FUNCTION refresh_materialized_views_trigger();

CREATE TRIGGER refresh_portfolio_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON portfolio_items
FOR EACH STATEMENT EXECUTE FUNCTION refresh_materialized_views_trigger();

-- Add function to calculate job matching scores
CREATE OR REPLACE FUNCTION calculate_job_matching_score(
    p_job_id UUID,
    p_user_id UUID
) RETURNS DECIMAL AS $$
DECLARE
    v_skill_match_score DECIMAL;
    v_location_match_score DECIMAL;
    v_availability_match_score DECIMAL;
    v_experience_match_score DECIMAL;
    v_overall_score DECIMAL;
BEGIN
    -- Calculate skill match score
    SELECT COALESCE(
        (SELECT COUNT(*)::DECIMAL / NULLIF(COUNT(*) OVER (), 0)
        FROM staff_jobs_skills js
        JOIN user_skills us ON js.skill_id = us.id
        WHERE js.job_id = p_job_id AND us.user_id = p_user_id),
        0
    ) INTO v_skill_match_score;

    -- Calculate location match score
    SELECT COALESCE(
        (SELECT 1.0 - (ST_Distance(
            (SELECT location FROM staff_jobs WHERE id = p_job_id),
            (SELECT preferred_location FROM user_preferences WHERE user_id = p_user_id)
        ) / 100000.0)),
        0
    ) INTO v_location_match_score;

    -- Calculate availability match score
    SELECT COALESCE(
        (SELECT 1.0 - ABS(
            EXTRACT(EPOCH FROM (sj.start_date - up.availability_start))::DECIMAL / 
            (86400 * 30)
        )),
        0
    ) INTO v_availability_match_score
    FROM staff_jobs sj
    CROSS JOIN user_preferences up
    WHERE sj.id = p_job_id AND up.user_id = p_user_id;

    -- Calculate experience match score
    SELECT COALESCE(
        (SELECT AVG(us.years_of_experience) / 10.0
        FROM user_skills us
        WHERE us.user_id = p_user_id),
        0
    ) INTO v_experience_match_score;

    -- Calculate overall score
    v_overall_score := (
        v_skill_match_score * 0.4 +
        v_location_match_score * 0.2 +
        v_availability_match_score * 0.2 +
        v_experience_match_score * 0.2
    );

    RETURN v_overall_score;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update job matching scores
CREATE OR REPLACE FUNCTION update_job_matching_scores_trigger()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO job_matching_scores (
            job_id,
            user_id,
            skill_match_score,
            location_match_score,
            availability_match_score,
            experience_match_score,
            overall_score
        )
        SELECT 
            NEW.id,
            up.user_id,
            calculate_job_matching_score(NEW.id, up.user_id),
            calculate_job_matching_score(NEW.id, up.user_id),
            calculate_job_matching_score(NEW.id, up.user_id),
            calculate_job_matching_score(NEW.id, up.user_id),
            calculate_job_matching_score(NEW.id, up.user_id)
        FROM user_preferences up
        ON CONFLICT (job_id, user_id) DO UPDATE SET
            skill_match_score = EXCLUDED.skill_match_score,
            location_match_score = EXCLUDED.location_match_score,
            availability_match_score = EXCLUDED.availability_match_score,
            experience_match_score = EXCLUDED.experience_match_score,
            overall_score = EXCLUDED.overall_score,
            updated_at = NOW();
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_matching_scores_trigger
AFTER INSERT OR UPDATE ON staff_jobs
FOR EACH ROW EXECUTE FUNCTION update_job_matching_scores_trigger(); 