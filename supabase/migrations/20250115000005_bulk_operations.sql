-- Bulk Operations System Migration
-- Efficient management of multiple accounts with batch operations

-- Create bulk_operations table to track batch jobs
CREATE TABLE IF NOT EXISTS bulk_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('bulk_post', 'bulk_edit', 'bulk_follow', 'bulk_unfollow', 'bulk_delete', 'campaign_sync', 'account_migration', 'content_sync')),
  operation_name TEXT NOT NULL,
  
  -- Target accounts and scope
  target_accounts UUID[] NOT NULL,
  total_targets INTEGER NOT NULL DEFAULT 0,
  
  -- Operation details
  operation_parameters JSONB NOT NULL DEFAULT '{}',
  execution_strategy TEXT DEFAULT 'sequential' CHECK (execution_strategy IN ('sequential', 'parallel', 'batched', 'scheduled')),
  batch_size INTEGER DEFAULT 10,
  delay_between_batches INTEGER DEFAULT 5, -- seconds
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'paused', 'completed', 'failed', 'cancelled')),
  progress_percentage FLOAT DEFAULT 0.0,
  current_target_index INTEGER DEFAULT 0,
  
  -- Results tracking
  successful_targets UUID[] DEFAULT '{}',
  failed_targets UUID[] DEFAULT '{}',
  skipped_targets UUID[] DEFAULT '{}',
  error_details JSONB DEFAULT '{}',
  
  -- Performance metrics
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_at TIMESTAMP WITH TIME ZONE,
  processing_time_seconds INTEGER DEFAULT 0,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  repeat_schedule JSONB DEFAULT '{}', -- for recurring operations
  timezone TEXT DEFAULT 'UTC',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk_operation_logs table for detailed logging
CREATE TABLE IF NOT EXISTS bulk_operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bulk_operation_id UUID REFERENCES bulk_operations(id) ON DELETE CASCADE NOT NULL,
  target_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Log details
  log_level TEXT DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
  log_message TEXT NOT NULL,
  operation_step TEXT, -- which part of the operation this log refers to
  
  -- Context data
  context_data JSONB DEFAULT '{}',
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timing
  step_duration_ms INTEGER DEFAULT 0,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_coordination table for coordinated multi-account campaigns
CREATE TABLE IF NOT EXISTS campaign_coordination (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT DEFAULT 'content' CHECK (campaign_type IN ('content', 'engagement', 'growth', 'event', 'product_launch')),
  
  -- Campaign details
  description TEXT,
  participating_accounts UUID[] NOT NULL,
  content_variations JSONB DEFAULT '{}', -- Different content for different accounts
  hashtag_strategy JSONB DEFAULT '{}',
  
  -- Timing coordination
  synchronized_posting BOOLEAN DEFAULT TRUE,
  posting_schedule JSONB DEFAULT '[]', -- [{account_id, scheduled_time, content_variation}]
  timezone_coordination TEXT DEFAULT 'UTC',
  
  -- Performance tracking
  campaign_goals JSONB DEFAULT '{}', -- {"total_reach": 10000, "engagement_rate": 5.0}
  performance_metrics JSONB DEFAULT '{}',
  success_criteria JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'paused', 'cancelled')),
  launch_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create account_templates table for bulk account management
CREATE TABLE IF NOT EXISTS account_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('profile_settings', 'content_strategy', 'posting_schedule', 'hashtag_groups', 'bio_template')),
  
  -- Template content
  template_data JSONB NOT NULL DEFAULT '{}',
  applicable_account_types TEXT[] DEFAULT '{}',
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  
  -- Versioning
  template_version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_name)
);

-- Create mass_actions table for tracking individual actions within bulk operations
CREATE TABLE IF NOT EXISTS mass_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bulk_operation_id UUID REFERENCES bulk_operations(id) ON DELETE CASCADE NOT NULL,
  target_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  
  -- Action details
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}',
  
  -- Execution details
  execution_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  
  -- Results
  result_data JSONB DEFAULT '{}',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk_analytics table for bulk operation analytics
CREATE TABLE IF NOT EXISTS bulk_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_date DATE NOT NULL,
  
  -- Operation statistics
  total_operations INTEGER DEFAULT 0,
  successful_operations INTEGER DEFAULT 0,
  failed_operations INTEGER DEFAULT 0,
  
  -- Performance metrics
  average_completion_time_minutes FLOAT DEFAULT 0.0,
  total_accounts_processed INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  
  -- Resource utilization
  total_processing_time_hours FLOAT DEFAULT 0.0,
  peak_concurrent_operations INTEGER DEFAULT 0,
  
  -- Operation type breakdown
  operation_type_stats JSONB DEFAULT '{}', -- {"bulk_post": 15, "bulk_edit": 8, ...}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, analysis_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bulk_operations_user ON bulk_operations(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bulk_operation_logs_operation ON bulk_operation_logs(bulk_operation_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_coordination_user ON campaign_coordination(user_id, status, launch_date);
CREATE INDEX IF NOT EXISTS idx_account_templates_user ON account_templates(user_id, template_type, is_active);
CREATE INDEX IF NOT EXISTS idx_mass_actions_operation ON mass_actions(bulk_operation_id, execution_order);
CREATE INDEX IF NOT EXISTS idx_bulk_analytics_user ON bulk_analytics(user_id, analysis_date DESC);

-- Function to create bulk posting operation
CREATE OR REPLACE FUNCTION create_bulk_posting_operation(
  p_user_id UUID,
  p_operation_name TEXT,
  p_target_accounts UUID[],
  p_content TEXT,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_media_urls JSONB DEFAULT '[]',
  p_hashtags TEXT[] DEFAULT '{}',
  p_post_type TEXT DEFAULT 'text',
  p_visibility TEXT DEFAULT 'public'
)
RETURNS UUID AS $$
DECLARE
  operation_id UUID;
  account_id UUID;
  action_order INTEGER := 1;
BEGIN
  -- Create the bulk operation
  INSERT INTO bulk_operations (
    user_id,
    operation_type,
    operation_name,
    target_accounts,
    total_targets,
    operation_parameters,
    scheduled_for,
    status
  )
  VALUES (
    p_user_id,
    'bulk_post',
    p_operation_name,
    p_target_accounts,
    array_length(p_target_accounts, 1),
    jsonb_build_object(
      'content', p_content,
      'media_urls', p_media_urls,
      'hashtags', p_hashtags,
      'post_type', p_post_type,
      'visibility', p_visibility
    ),
    p_scheduled_for,
    CASE WHEN p_scheduled_for <= NOW() THEN 'pending' ELSE 'scheduled' END
  )
  RETURNING id INTO operation_id;
  
  -- Create individual mass actions for each account
  FOREACH account_id IN ARRAY p_target_accounts
  LOOP
    -- Verify user owns this account
    IF EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND owner_user_id = p_user_id AND is_active = TRUE) THEN
      INSERT INTO mass_actions (
        bulk_operation_id,
        target_account_id,
        action_type,
        action_data,
        execution_order
      )
      VALUES (
        operation_id,
        account_id,
        'create_post',
        jsonb_build_object(
          'content', p_content,
          'media_urls', p_media_urls,
          'hashtags', p_hashtags,
          'post_type', p_post_type,
          'visibility', p_visibility
        ),
        action_order
      );
      
      action_order := action_order + 1;
    ELSE
      -- Log error for accounts user doesn't own
      INSERT INTO bulk_operation_logs (
        bulk_operation_id,
        target_account_id,
        log_level,
        log_message,
        error_code
      )
      VALUES (
        operation_id,
        account_id,
        'error',
        'User does not own this account or account is inactive',
        'ACCOUNT_ACCESS_DENIED'
      );
    END IF;
  END LOOP;
  
  RETURN operation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute bulk operation
CREATE OR REPLACE FUNCTION execute_bulk_operation(p_operation_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  operation_record bulk_operations%ROWTYPE;
  action_record RECORD;
  success_count INTEGER := 0;
  failure_count INTEGER := 0;
  post_id UUID;
BEGIN
  -- Get operation details
  SELECT * INTO operation_record FROM bulk_operations WHERE id = p_operation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bulk operation not found: %', p_operation_id;
  END IF;
  
  -- Update status to in_progress
  UPDATE bulk_operations SET
    status = 'in_progress',
    started_at = NOW(),
    updated_at = NOW()
  WHERE id = p_operation_id;
  
  -- Process each mass action
  FOR action_record IN
    SELECT * FROM mass_actions
    WHERE bulk_operation_id = p_operation_id
    ORDER BY execution_order
  LOOP
    BEGIN
      -- Update action status
      UPDATE mass_actions SET
        status = 'in_progress',
        started_at = NOW()
      WHERE id = action_record.id;
      
      -- Execute the action based on type
      CASE action_record.action_type
        WHEN 'create_post' THEN
          -- Create post using existing function
          INSERT INTO posts (
            user_id,
            account_id,
            content,
            type,
            visibility,
            media_urls,
            hashtags
          )
          VALUES (
            operation_record.user_id,
            action_record.target_account_id,
            action_record.action_data->>'content',
            COALESCE(action_record.action_data->>'post_type', 'text'),
            COALESCE(action_record.action_data->>'visibility', 'public'),
            COALESCE(action_record.action_data->'media_urls', '[]'::jsonb),
            COALESCE(
              ARRAY(SELECT jsonb_array_elements_text(action_record.action_data->'hashtags')),
              '{}'::text[]
            )
          )
          RETURNING id INTO post_id;
          
          -- Update action with success
          UPDATE mass_actions SET
            status = 'completed',
            completed_at = NOW(),
            result_data = jsonb_build_object('post_id', post_id)
          WHERE id = action_record.id;
          
          success_count := success_count + 1;
          
        ELSE
          -- Unknown action type
          UPDATE mass_actions SET
            status = 'failed',
            completed_at = NOW(),
            error_message = 'Unknown action type: ' || action_record.action_type
          WHERE id = action_record.id;
          
          failure_count := failure_count + 1;
      END CASE;
      
    EXCEPTION WHEN OTHERS THEN
      -- Handle action failure
      UPDATE mass_actions SET
        status = 'failed',
        completed_at = NOW(),
        error_message = SQLERRM
      WHERE id = action_record.id;
      
      failure_count := failure_count + 1;
      
      -- Log the error
      INSERT INTO bulk_operation_logs (
        bulk_operation_id,
        target_account_id,
        log_level,
        log_message,
        error_code
      )
      VALUES (
        p_operation_id,
        action_record.target_account_id,
        'error',
        'Action failed: ' || SQLERRM,
        'ACTION_EXECUTION_ERROR'
      );
    END;
  END LOOP;
  
  -- Update operation completion status
  UPDATE bulk_operations SET
    status = CASE WHEN failure_count = 0 THEN 'completed' ELSE 'completed' END,
    completed_at = NOW(),
    progress_percentage = 100.0,
    successful_targets = (
      SELECT array_agg(target_account_id)
      FROM mass_actions
      WHERE bulk_operation_id = p_operation_id AND status = 'completed'
    ),
    failed_targets = (
      SELECT array_agg(target_account_id)
      FROM mass_actions
      WHERE bulk_operation_id = p_operation_id AND status = 'failed'
    ),
    updated_at = NOW()
  WHERE id = p_operation_id;
  
  -- Log completion
  INSERT INTO bulk_operation_logs (
    bulk_operation_id,
    log_level,
    log_message,
    context_data
  )
  VALUES (
    p_operation_id,
    'info',
    'Bulk operation completed',
    jsonb_build_object(
      'successful_actions', success_count,
      'failed_actions', failure_count,
      'total_actions', success_count + failure_count
    )
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create coordinated campaign
CREATE OR REPLACE FUNCTION create_coordinated_campaign(
  p_user_id UUID,
  p_campaign_name TEXT,
  p_participating_accounts UUID[],
  p_content_variations JSONB,
  p_launch_date TIMESTAMP WITH TIME ZONE,
  p_campaign_goals JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  campaign_id UUID;
  posting_schedule JSONB := '[]'::jsonb;
  account_id UUID;
  content_variation JSONB;
BEGIN
  -- Create the campaign
  INSERT INTO campaign_coordination (
    user_id,
    campaign_name,
    participating_accounts,
    content_variations,
    campaign_goals,
    launch_date,
    status
  )
  VALUES (
    p_user_id,
    p_campaign_name,
    p_participating_accounts,
    p_content_variations,
    p_campaign_goals,
    p_launch_date,
    'scheduled'
  )
  RETURNING id INTO campaign_id;
  
  -- Create synchronized posting schedule
  FOREACH account_id IN ARRAY p_participating_accounts
  LOOP
    -- Get content variation for this account (or use default)
    SELECT COALESCE(
      p_content_variations->account_id::text,
      p_content_variations->'default'
    ) INTO content_variation;
    
    IF content_variation IS NOT NULL THEN
      posting_schedule := posting_schedule || jsonb_build_object(
        'account_id', account_id,
        'scheduled_time', p_launch_date,
        'content_variation', content_variation
      );
    END IF;
  END LOOP;
  
  -- Update campaign with posting schedule
  UPDATE campaign_coordination SET
    posting_schedule = posting_schedule,
    updated_at = NOW()
  WHERE id = campaign_id;
  
  RETURN campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get bulk operation status
CREATE OR REPLACE FUNCTION get_bulk_operation_status(p_operation_id UUID)
RETURNS TABLE (
  operation_id UUID,
  operation_name TEXT,
  status TEXT,
  progress_percentage FLOAT,
  successful_count INTEGER,
  failed_count INTEGER,
  total_count INTEGER,
  estimated_completion_at TIMESTAMP WITH TIME ZONE,
  recent_logs JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH operation_stats AS (
    SELECT 
      bo.id,
      bo.operation_name,
      bo.status,
      bo.progress_percentage,
      array_length(bo.successful_targets, 1) as successful_count,
      array_length(bo.failed_targets, 1) as failed_count,
      bo.total_targets,
      bo.estimated_completion_at
    FROM bulk_operations bo
    WHERE bo.id = p_operation_id
  ),
  recent_logs AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'timestamp', bol.logged_at,
        'level', bol.log_level,
        'message', bol.log_message,
        'account_id', bol.target_account_id
      ) ORDER BY bol.logged_at DESC
    ) as logs
    FROM bulk_operation_logs bol
    WHERE bol.bulk_operation_id = p_operation_id
    AND bol.logged_at >= NOW() - INTERVAL '1 hour'
    LIMIT 10
  )
  SELECT 
    os.id,
    os.operation_name,
    os.status,
    os.progress_percentage,
    COALESCE(os.successful_count, 0),
    COALESCE(os.failed_count, 0),
    os.total_targets,
    os.estimated_completion_at,
    COALESCE(rl.logs, '[]'::jsonb)
  FROM operation_stats os
  CROSS JOIN recent_logs rl;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_coordination ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mass_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their bulk operations" ON bulk_operations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view logs for their operations" ON bulk_operation_logs
  FOR SELECT USING (
    bulk_operation_id IN (SELECT id FROM bulk_operations WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their campaigns" ON campaign_coordination
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their templates" ON account_templates
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view mass actions for their operations" ON mass_actions
  FOR SELECT USING (
    bulk_operation_id IN (SELECT id FROM bulk_operations WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their bulk analytics" ON bulk_analytics
  FOR SELECT USING (user_id = auth.uid());

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Bulk operations system created successfully!';
  RAISE NOTICE 'ℹ️  Features: Batch posting, coordinated campaigns, mass actions, operation tracking';
  RAISE NOTICE 'ℹ️  Use create_bulk_posting_operation() to create bulk posts';
  RAISE NOTICE 'ℹ️  Use execute_bulk_operation() to run operations';
  RAISE NOTICE 'ℹ️  Use create_coordinated_campaign() for multi-account campaigns';
  RAISE NOTICE 'ℹ️  Use get_bulk_operation_status() to track progress';
END $$; 