-- Account Verification System Migration
-- Creates comprehensive verification workflows with automated processing

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('identity', 'business', 'artist', 'venue', 'influence')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'requires_info')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5), -- 1 = highest priority
  
  -- Verification data
  submitted_documents JSONB DEFAULT '[]',
  verification_data JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  business_info JSONB DEFAULT '{}',
  
  -- Review information
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  rejection_reason TEXT,
  requirements_checklist JSONB DEFAULT '{}',
  
  -- Automation
  auto_verification_score FLOAT DEFAULT 0.0,
  verification_criteria_met JSONB DEFAULT '{}',
  external_verification_data JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Create verification_criteria table for different account types
CREATE TABLE IF NOT EXISTS verification_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_type TEXT NOT NULL,
  criteria_name TEXT NOT NULL,
  criteria_description TEXT,
  required_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  minimum_score FLOAT DEFAULT 0.0,
  auto_verify_threshold FLOAT DEFAULT 0.8,
  weight FLOAT DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_type, criteria_name)
);

-- Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_request_id UUID REFERENCES verification_requests(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_card', 'passport', 'business_license', 'tax_document', 'social_proof', 'portfolio', 'press_kit', 'other')),
  document_url TEXT NOT NULL,
  document_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_history table for audit trail
CREATE TABLE IF NOT EXISTS verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  verification_request_id UUID REFERENCES verification_requests(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_badges table for different types of verification
CREATE TABLE IF NOT EXISTS verification_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('verified', 'business', 'artist', 'venue', 'influencer', 'government', 'media')),
  badge_level INTEGER DEFAULT 1 CHECK (badge_level BETWEEN 1 AND 5),
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revocation_reason TEXT,
  metadata JSONB DEFAULT '{}',
  UNIQUE(account_id, badge_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_account ON verification_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_verification_documents_request ON verification_documents(verification_request_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_account ON verification_history(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_badges_account ON verification_badges(account_id);

-- Insert default verification criteria
INSERT INTO verification_criteria (account_type, criteria_name, criteria_description, required_documents, minimum_score, auto_verify_threshold, weight) VALUES
('artist', 'social_presence', 'Strong social media presence with consistent content', ARRAY['social_proof']::TEXT[], 0.6, 0.8, 1.0),
('artist', 'content_quality', 'High-quality original content and portfolio', ARRAY['portfolio']::TEXT[], 0.7, 0.85, 1.2),
('artist', 'identity_verification', 'Valid government-issued ID', ARRAY['id_card', 'passport']::TEXT[], 0.9, 0.95, 1.5),
('artist', 'industry_recognition', 'Recognition from industry professionals or media', ARRAY['press_kit', 'social_proof']::TEXT[], 0.5, 0.7, 1.1),

('venue', 'business_license', 'Valid business license and registration', ARRAY['business_license']::TEXT[], 0.9, 0.95, 1.8),
('venue', 'location_verification', 'Physical location verification', ARRAY['business_license']::TEXT[], 0.8, 0.9, 1.3),
('venue', 'identity_verification', 'Owner/manager identity verification', ARRAY['id_card', 'passport']::TEXT[], 0.9, 0.95, 1.5),
('venue', 'operational_proof', 'Proof of active venue operations', ARRAY['social_proof', 'other']::TEXT[], 0.6, 0.8, 1.0),

('primary', 'identity_verification', 'Valid government-issued ID', ARRAY['id_card', 'passport']::TEXT[], 0.9, 0.95, 1.5),
('primary', 'contact_verification', 'Verified email and phone number', ARRAY[]::TEXT[], 0.8, 0.9, 1.0),

('business', 'business_registration', 'Valid business registration documents', ARRAY['business_license', 'tax_document']::TEXT[], 0.9, 0.95, 1.8),
('business', 'financial_standing', 'Proof of financial standing', ARRAY['tax_document']::TEXT[], 0.7, 0.85, 1.2),
('business', 'identity_verification', 'Owner/representative identity verification', ARRAY['id_card', 'passport']::TEXT[], 0.9, 0.95, 1.5);

-- Function to calculate verification score
CREATE OR REPLACE FUNCTION calculate_verification_score(
  p_account_id UUID,
  p_verification_data JSONB
)
RETURNS FLOAT AS $$
DECLARE
  account_type_val TEXT;
  total_score FLOAT := 0.0;
  total_weight FLOAT := 0.0;
  criteria_rec RECORD;
  criteria_score FLOAT;
BEGIN
  -- Get account type
  SELECT account_type INTO account_type_val
  FROM accounts
  WHERE id = p_account_id;
  
  IF account_type_val IS NULL THEN
    RETURN 0.0;
  END IF;
  
  -- Calculate score based on criteria
  FOR criteria_rec IN 
    SELECT * FROM verification_criteria 
    WHERE account_type = account_type_val AND is_active = TRUE
  LOOP
    -- Calculate score for this criteria (simplified logic)
    criteria_score := COALESCE((p_verification_data->criteria_rec.criteria_name)::FLOAT, 0.0);
    
    total_score := total_score + (criteria_score * criteria_rec.weight);
    total_weight := total_weight + criteria_rec.weight;
  END LOOP;
  
  -- Return normalized score
  IF total_weight > 0 THEN
    RETURN LEAST(total_score / total_weight, 1.0);
  ELSE
    RETURN 0.0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit verification request
CREATE OR REPLACE FUNCTION submit_verification_request(
  p_account_id UUID,
  p_request_type TEXT,
  p_verification_data JSONB DEFAULT '{}',
  p_social_links JSONB DEFAULT '{}',
  p_business_info JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  request_id UUID;
  auto_score FLOAT;
  account_type_val TEXT;
BEGIN
  -- Get account type
  SELECT account_type INTO account_type_val
  FROM accounts
  WHERE id = p_account_id;
  
  -- Calculate auto verification score
  auto_score := calculate_verification_score(p_account_id, p_verification_data);
  
  -- Create verification request
  INSERT INTO verification_requests (
    account_id,
    request_type,
    verification_data,
    social_links,
    business_info,
    auto_verification_score,
    status,
    priority
  )
  VALUES (
    p_account_id,
    p_request_type,
    p_verification_data,
    p_social_links,
    p_business_info,
    auto_score,
    CASE WHEN auto_score >= 0.9 THEN 'approved' ELSE 'pending' END,
    CASE WHEN auto_score >= 0.8 THEN 1 ELSE 3 END
  )
  RETURNING id INTO request_id;
  
  -- Add to history
  INSERT INTO verification_history (account_id, verification_request_id, action, new_status, notes)
  VALUES (p_account_id, request_id, 'request_submitted', 'pending', 'Verification request submitted');
  
  -- Auto-approve if score is high enough
  IF auto_score >= 0.9 THEN
    PERFORM approve_verification_request(request_id, NULL, 'Auto-approved based on verification score');
  END IF;
  
  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve verification request
CREATE OR REPLACE FUNCTION approve_verification_request(
  p_request_id UUID,
  p_reviewed_by UUID DEFAULT NULL,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  request_rec RECORD;
  badge_type_val TEXT;
BEGIN
  -- Get request details
  SELECT * INTO request_rec
  FROM verification_requests
  WHERE id = p_request_id AND status IN ('pending', 'under_review', 'requires_info');
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update request status
  UPDATE verification_requests SET
    status = 'approved',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    review_notes = p_review_notes,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Update account verification status
  UPDATE accounts SET
    is_verified = TRUE,
    updated_at = NOW()
  WHERE id = request_rec.account_id;
  
  -- Determine badge type
  badge_type_val := CASE
    WHEN request_rec.request_type = 'business' THEN 'business'
    WHEN request_rec.request_type = 'artist' THEN 'artist'
    WHEN request_rec.request_type = 'venue' THEN 'venue'
    WHEN request_rec.request_type = 'influence' THEN 'influencer'
    ELSE 'verified'
  END;
  
  -- Issue verification badge
  INSERT INTO verification_badges (account_id, badge_type, issued_by, metadata)
  VALUES (
    request_rec.account_id,
    badge_type_val,
    p_reviewed_by,
    jsonb_build_object('verification_request_id', p_request_id, 'auto_verification_score', request_rec.auto_verification_score)
  )
  ON CONFLICT (account_id, badge_type) 
  DO UPDATE SET
    issued_by = EXCLUDED.issued_by,
    issued_at = NOW(),
    metadata = EXCLUDED.metadata,
    revoked_at = NULL,
    revoked_by = NULL,
    revocation_reason = NULL;
  
  -- Add to history
  INSERT INTO verification_history (account_id, verification_request_id, action, old_status, new_status, performed_by, notes)
  VALUES (request_rec.account_id, p_request_id, 'approved', request_rec.status, 'approved', p_reviewed_by, p_review_notes);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject verification request
CREATE OR REPLACE FUNCTION reject_verification_request(
  p_request_id UUID,
  p_reviewed_by UUID,
  p_rejection_reason TEXT,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  request_rec RECORD;
BEGIN
  -- Get request details
  SELECT * INTO request_rec
  FROM verification_requests
  WHERE id = p_request_id AND status IN ('pending', 'under_review', 'requires_info');
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update request status
  UPDATE verification_requests SET
    status = 'rejected',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason,
    review_notes = p_review_notes,
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Add to history
  INSERT INTO verification_history (account_id, verification_request_id, action, old_status, new_status, performed_by, notes)
  VALUES (request_rec.account_id, p_request_id, 'rejected', request_rec.status, 'rejected', p_reviewed_by, p_rejection_reason);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get verification status
CREATE OR REPLACE FUNCTION get_verification_status(p_account_id UUID)
RETURNS TABLE (
  is_verified BOOLEAN,
  badges JSONB,
  pending_requests INTEGER,
  verification_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.is_verified,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'type', vb.badge_type,
          'level', vb.badge_level,
          'issued_at', vb.issued_at,
          'expires_at', vb.expires_at
        )
      ) FILTER (WHERE vb.badge_type IS NOT NULL AND vb.revoked_at IS NULL),
      '[]'::jsonb
    ) as badges,
    (
      SELECT COUNT(*)::INTEGER
      FROM verification_requests vr
      WHERE vr.account_id = p_account_id AND vr.status IN ('pending', 'under_review', 'requires_info')
    ) as pending_requests,
    COALESCE(
      (
        SELECT MAX(auto_verification_score)
        FROM verification_requests vr
        WHERE vr.account_id = p_account_id
      ),
      0.0
    ) as verification_score
  FROM accounts a
  LEFT JOIN verification_badges vb ON a.id = vb.account_id
  WHERE a.id = p_account_id
  GROUP BY a.id, a.is_verified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own verification requests" ON verification_requests
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can create verification requests for their accounts" ON verification_requests
  FOR INSERT WITH CHECK (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all verification requests" ON verification_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = TRUE OR role = 'admin'))
  );

CREATE POLICY "Users can view their verification documents" ON verification_documents
  FOR SELECT USING (
    verification_request_id IN (
      SELECT id FROM verification_requests WHERE account_id IN (
        SELECT id FROM accounts WHERE owner_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can upload verification documents" ON verification_documents
  FOR INSERT WITH CHECK (
    verification_request_id IN (
      SELECT id FROM verification_requests WHERE account_id IN (
        SELECT id FROM accounts WHERE owner_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Public can view verification badges" ON verification_badges
  FOR SELECT USING (revoked_at IS NULL);

CREATE POLICY "Users can view their verification history" ON verification_history
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Account verification system created successfully!';
  RAISE NOTICE 'ℹ️  Features: Automated scoring, verification workflows, badges, audit trail';
  RAISE NOTICE 'ℹ️  Use submit_verification_request() to start verification process';
  RAISE NOTICE 'ℹ️  Use get_verification_status() to check verification status';
END $$; 