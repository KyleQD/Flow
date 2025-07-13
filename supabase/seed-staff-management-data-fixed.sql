-- =============================================================================
-- FIXED SAMPLE DATA FOR STAFF MANAGEMENT & JOB BOARD SYSTEM
-- This script uses correct column names and proper array casting
-- Run this AFTER the main migration to get a working demo
-- =============================================================================

-- Get a venue ID to work with (use first available venue)
DO $$
DECLARE
  venue_record RECORD;
  template_id UUID;
  job_1_id UUID;
  job_2_id UUID;
  job_3_id UUID;
  app_1_id UUID;
  app_2_id UUID;
  app_3_id UUID;
  candidate_1_id UUID;
BEGIN
  -- Get the first venue for sample data
  SELECT id, user_id INTO venue_record FROM venue_profiles LIMIT 1;
  
  IF venue_record.id IS NOT NULL THEN
    RAISE NOTICE '📝 Creating sample data for venue: %', venue_record.id;

    -- =============================================================================
    -- 1. SAMPLE JOB POSTINGS (Using correct column names)
    -- =============================================================================
    
    -- Job 1: Sound Engineer
    INSERT INTO staff_jobs (
      venue_id, posted_by, title, description, role, department, location,
      job_type, salary_min, salary_max, priority, requirements, required_skills, 
      benefits, status, application_deadline, shift_type, is_featured, tags
    ) VALUES (
      venue_record.id,
      venue_record.user_id,
      'Senior Sound Engineer',
      'We are seeking an experienced Sound Engineer to join our technical team. You will be responsible for managing live sound for concerts, events, and performances at our venue.',
      'Senior Sound Engineer',
      'Technical',
      'Main Venue',
      'full_time',
      65000.00,
      80000.00,
      'high',
      ARRAY['5+ years experience in live sound', 'Knowledge of digital mixing consoles', 'Experience with large-scale events'],
      ARRAY['Pro Tools', 'Live Sound', 'Mixing', 'Audio Engineering', 'Equipment Setup'],
      ARRAY['Health Insurance', 'Dental Coverage', 'Equipment Allowance', '401k'],
      'open',
      (NOW() + INTERVAL '30 days')::DATE,
      'day',
      true,
      ARRAY['technical', 'audio', 'full-time']
    ) RETURNING id INTO job_1_id;

    -- Job 2: Security Guard
    INSERT INTO staff_jobs (
      venue_id, posted_by, title, description, role, department, location,
      job_type, salary_min, salary_max, priority, requirements, required_skills,
      benefits, status, application_deadline, shift_type, is_featured, tags
    ) VALUES (
      venue_record.id,
      venue_record.user_id,
      'Event Security Guard',
      'Join our security team to ensure the safety and security of our venue during events. Experience in crowd control and emergency response preferred.',
      'Security Guard',
      'Security',
      'All Venue Areas',
      'part_time',
      18.00,
      25.00,
      'medium',
      ARRAY['Valid security license', 'Clean background check', 'Physical fitness'],
      ARRAY['Crowd Control', 'First Aid', 'De-escalation', 'Emergency Response'],
      ARRAY['Flexible Scheduling', 'Training Provided', 'Uniform Allowance'],
      'open',
      (NOW() + INTERVAL '14 days')::DATE,
      'evening',
      false,
      ARRAY['security', 'part-time', 'events']
    ) RETURNING id INTO job_2_id;

    -- Job 3: Event Coordinator
    INSERT INTO staff_jobs (
      venue_id, posted_by, title, description, role, department, location,
      job_type, salary_min, salary_max, priority, requirements, required_skills,
      benefits, status, application_deadline, shift_type, is_featured, tags
    ) VALUES (
      venue_record.id,
      venue_record.user_id,
      'Event Coordinator',
      'Coordinate and manage events from planning to execution. Work with artists, vendors, and internal teams to ensure successful events.',
      'Event Coordinator',
      'Operations',
      'Office & Venue',
      'full_time',
      45000.00,
      55000.00,
      'urgent',
      ARRAY['Bachelor''s degree preferred', '2+ years event management', 'Strong communication skills'],
      ARRAY['Event Planning', 'Project Management', 'Communication', 'Vendor Relations'],
      ARRAY['Health Insurance', 'PTO', 'Professional Development', 'Event Perks'],
      'open',
      (NOW() + INTERVAL '7 days')::DATE,
      'flexible',
      true,
      ARRAY['events', 'coordination', 'full-time']
    ) RETURNING id INTO job_3_id;

    -- =============================================================================
    -- 2. SAMPLE JOB APPLICATIONS (Using correct column names)
    -- =============================================================================
    
    -- Application 1: For Sound Engineer position
    INSERT INTO staff_applications (
      job_id, applicant_id, full_name, email, phone,
      cover_letter, experience_years, skills, availability, status,
      rating, ai_match_score, stage
    ) VALUES (
      job_1_id,
      venue_record.user_id, -- Using venue owner as applicant for demo
      'Sarah Johnson',
      'sarah.johnson@email.com',
      '(555) 123-4567',
      'I am writing to express my strong interest in the Senior Sound Engineer position at your venue. With over 7 years of experience in live sound engineering, I have worked on numerous large-scale events and am proficient in all major mixing console platforms.',
      7,
      ARRAY['Pro Tools', 'Live Sound', 'Mixing', 'Audio Engineering', 'Equipment Setup', 'Dante Networks'],
      'Immediate',
      'reviewed',
      5,
      92,
      'interviewed'
    ) RETURNING id INTO app_1_id;

    -- Application 2: For Security position
    INSERT INTO staff_applications (
      job_id, applicant_id, full_name, email, phone,
      cover_letter, experience_years, skills, availability, status,
      rating, ai_match_score, stage
    ) VALUES (
      job_2_id,
      venue_record.user_id,
      'Mike Rodriguez',
      'mike.rodriguez@email.com',
      '(555) 234-5678',
      'As a former law enforcement officer with 5 years of experience, I am excited to bring my security expertise to your venue. I have extensive experience in crowd control and emergency response.',
      5,
      ARRAY['Crowd Control', 'First Aid', 'De-escalation', 'Emergency Response', 'Event Security Experience'],
      'Weekends and Evenings',
      'interviewed',
      4,
      88,
      'background_check'
    ) RETURNING id INTO app_2_id;

    -- Application 3: For Event Coordinator position
    INSERT INTO staff_applications (
      job_id, applicant_id, full_name, email, phone,
      cover_letter, experience_years, skills, availability, status,
      rating, ai_match_score, stage
    ) VALUES (
      job_3_id,
      venue_record.user_id,
      'Emily Chen',
      'emily.chen@email.com',
      '(555) 345-6789',
      'I am passionate about creating memorable events and have 4 years of experience coordinating events ranging from corporate meetings to music festivals. My strong organizational skills and attention to detail make me an ideal candidate.',
      4,
      ARRAY['Event Planning', 'Project Management', 'Communication', 'Vendor Relations', 'Budget Management'],
      'Immediate',
      'pending',
      4,
      85,
      'applied'
    ) RETURNING id INTO app_3_id;

    -- =============================================================================
    -- 3. SAMPLE ONBOARDING TEMPLATES
    -- =============================================================================
    
    -- Template 1: Sound Engineer Complete Onboarding
    INSERT INTO staff_onboarding_templates (
      venue_id, name, department, position, description, estimated_days,
      required_documents, assignees, tags, is_default, use_count, created_by
    ) VALUES (
      venue_record.id,
      'Sound Engineer Complete',
      'Technical',
      'Sound Engineer',
      'Comprehensive onboarding for technical sound engineering roles',
      14,
      ARRAY['Resume', 'Portfolio', 'Certifications', 'Background Check'],
      ARRAY['Alex Chen', 'Senior Engineer', 'HR Manager'],
      ARRAY['technical', 'audio', 'equipment'],
      true,
      12,
      venue_record.user_id
    ) RETURNING id INTO template_id;

    -- Add steps for Sound Engineer template
    INSERT INTO staff_onboarding_steps (
      template_id, step_order, title, description, step_type, category,
      required, estimated_hours, assigned_to, instructions, completion_criteria
    ) VALUES 
      (template_id, 1, 'Welcome & Orientation', 'Introduction to venue, team, and company culture', 'meeting', 'social', true, 3, 'Alex Chen', 'Conduct venue tour, introduce team members, explain company values and expectations', ARRAY['Venue tour completed', 'Team introductions made', 'Employee handbook reviewed']),
      (template_id, 2, 'Equipment Familiarization', 'Learn venue''s audio equipment and systems', 'training', 'equipment', true, 16, 'Senior Engineer', 'Hands-on training with all audio equipment, mixing boards, and software systems', ARRAY['Can operate mixing board', 'Understands signal flow', 'Knows emergency procedures']),
      (template_id, 3, 'Safety Training', 'Complete venue safety protocols and certifications', 'training', 'admin', true, 4, 'Safety Manager', 'Complete safety training and emergency procedures', ARRAY['Safety quiz passed', 'Emergency procedures understood', 'PPE training completed']),
      (template_id, 4, 'System Access Setup', 'Configure user accounts and system permissions', 'setup', 'admin', true, 2, 'IT Department', 'Set up email, software licenses, access cards, and system permissions', ARRAY['Email account active', 'Software access granted', 'Security badge issued']),
      (template_id, 5, 'First Event Shadow', 'Shadow experienced engineer during live event', 'training', 'performance', true, 8, 'Senior Engineer', 'Observe and assist during actual event, take notes, ask questions', ARRAY['Event shadowing completed', 'Performance notes submitted', 'Feedback received']),
      (template_id, 6, '30-Day Review', 'Performance review and feedback session', 'review', 'performance', true, 2, 'Alex Chen', 'Conduct comprehensive review of performance, address any concerns, set goals', ARRAY['Review meeting completed', 'Performance goals set', 'Development plan created']);

    -- Template 2: Security Staff Basic
    INSERT INTO staff_onboarding_templates (
      venue_id, name, department, position, description, estimated_days,
      required_documents, assignees, tags, is_default, use_count, created_by
    ) VALUES (
      venue_record.id,
      'Security Staff Basic',
      'Security',
      'Security Guard',
      'Essential onboarding for security personnel',
      7,
      ARRAY['Security License', 'Background Check', 'First Aid Cert'],
      ARRAY['Security Chief', 'Training Coordinator'],
      ARRAY['security', 'safety', 'crowd-control'],
      false,
      8,
      venue_record.user_id
    );

    -- =============================================================================
    -- 4. SAMPLE ONBOARDING CANDIDATE
    -- =============================================================================
    
    -- Create onboarding candidate from hired application
    INSERT INTO staff_onboarding_candidates (
      venue_id, application_id, name, email, phone, position, department,
      status, stage, application_date, experience_years, skills,
      notes, assigned_manager, start_date, salary, employment_type,
      onboarding_progress, template_id
    ) VALUES (
      venue_record.id,
      app_1_id,
      'Sarah Johnson',
      'sarah.johnson@email.com',
      '(555) 123-4567',
      'Senior Sound Engineer',
      'Technical',
      'in_progress',
      'training',
      CURRENT_DATE - INTERVAL '5 days',
      7,
      ARRAY['Pro Tools', 'Live Sound', 'Mixing', 'Audio Engineering', 'Equipment Setup'],
      'Excellent technical skills, previous experience at major venues',
      'Alex Chen',
      CURRENT_DATE + INTERVAL '7 days',
      75000.00,
      'full_time',
      65,
      template_id
    ) RETURNING id INTO candidate_1_id;

    -- =============================================================================
    -- 5. SAMPLE STAFF MESSAGES
    -- =============================================================================
    
    INSERT INTO staff_messages (
      venue_id, sender_id, recipients, subject, content,
      message_type, priority, sent_at
    ) VALUES (
      venue_record.id,
      venue_record.user_id,
      ARRAY[venue_record.user_id], -- Self-message for demo
      'Welcome to the Team!',
      'Welcome to our venue team! We''re excited to have you join us. Please review the employee handbook and don''t hesitate to reach out if you have any questions.',
      'announcement',
      'normal',
      NOW() - INTERVAL '1 day'
    ),
    (
      venue_record.id,
      venue_record.user_id,
      ARRAY[venue_record.user_id],
      'Upcoming Event Schedule',
      'Please review the schedule for this weekend''s concert. All hands meeting tomorrow at 2 PM in the main conference room.',
      'schedule',
      'high',
      NOW() - INTERVAL '2 hours'
    ),
    (
      venue_record.id,
      venue_record.user_id,
      ARRAY[venue_record.user_id],
      'Safety Training Reminder',
      'Reminder: Monthly safety training is scheduled for Friday at 10 AM. Attendance is mandatory for all staff.',
      'training',
      'normal',
      NOW() - INTERVAL '3 days'
    );

    -- =============================================================================
    -- 6. SAMPLE ONBOARDING ACTIVITIES
    -- =============================================================================
    
    INSERT INTO staff_onboarding_activities (
      candidate_id, activity_type, title, description, status, completed_at
    ) VALUES 
      (candidate_1_id, 'step_completed', 'Welcome & Orientation Completed', 'Successfully completed venue orientation and team introductions', 'completed', NOW() - INTERVAL '3 days'),
      (candidate_1_id, 'step_completed', 'Equipment Training Started', 'Began hands-on training with audio equipment', 'completed', NOW() - INTERVAL '2 days'),
      (candidate_1_id, 'step_started', 'Safety Training In Progress', 'Currently completing safety protocols training', 'in_progress', NULL),
      (candidate_1_id, 'email_sent', 'Welcome Email Sent', 'Welcome package sent to new hire', 'completed', NOW() - INTERVAL '4 days'),
      (candidate_1_id, 'document_uploaded', 'Contract Signed', 'Employment contract has been signed and submitted', 'completed', NOW() - INTERVAL '1 day');

    -- =============================================================================
    -- 7. UPDATE APPLICATION STATUS FOR HIRED CANDIDATE
    -- =============================================================================
    
    -- Update application status for hired candidate
    UPDATE staff_applications SET status = 'hired', hired_date = NOW()::DATE WHERE id = app_1_id;

    RAISE NOTICE '✅ Successfully created sample data:';
    RAISE NOTICE '   📋 3 Job Postings (Sound Engineer, Security, Event Coordinator)';
    RAISE NOTICE '   👥 3 Job Applications with AI match scores';
    RAISE NOTICE '   📝 2 Onboarding Templates with steps';
    RAISE NOTICE '   🎯 1 Active Onboarding Candidate';
    RAISE NOTICE '   📨 3 Staff Messages';
    RAISE NOTICE '   📈 5 Onboarding Activities';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Sample data is ready for testing!';
    RAISE NOTICE '💡 You can now:';
    RAISE NOTICE '   - View job postings and applications';
    RAISE NOTICE '   - Test the onboarding wizard';
    RAISE NOTICE '   - Review candidate progress';
    RAISE NOTICE '   - Send staff communications';
    RAISE NOTICE '   - Analyze hiring metrics';

  ELSE
    RAISE NOTICE '⚠️  No venue found - please create a venue first before running sample data';
  END IF;
END $$; 