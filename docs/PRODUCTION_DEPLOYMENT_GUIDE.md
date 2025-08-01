# Production Deployment Guide - Phase 2 Onboarding System

## Overview

This guide provides step-by-step instructions for deploying the Phase 2 onboarding workflow system to production. The deployment includes database migrations, environment configuration, notification services setup, and post-deployment verification.

## Prerequisites

### System Requirements
- **Node.js**: Version 18+ 
- **PostgreSQL**: Version 15+
- **Supabase**: Production project configured
- **Vercel/Netlify**: Production hosting platform
- **Email Service**: SendGrid, Resend, or SMTP
- **SMS Service**: Twilio account
- **Push Notifications**: VAPID keys generated

### Pre-Deployment Checklist
- [ ] Database backup completed
- [ ] Environment variables configured
- [ ] Notification services tested
- [ ] User training materials ready
- [ ] Rollback plan prepared
- [ ] Monitoring tools configured

## Step 1: Database Migration

### 1.1 Backup Production Database

```bash
# Create backup before migration
supabase db dump --data-only > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Supabase dashboard
# Go to Database → Backups → Create backup
```

### 1.2 Apply Workflow System Migration

Since the migration had conflicts, we'll apply it manually:

```bash
# Option 1: Apply via Supabase Dashboard
# Go to Database → SQL Editor → Run the migration script

# Option 2: Apply via CLI (if conflicts resolved)
supabase db push --include-all

# Option 3: Manual application
# Copy the contents of apply_workflow_migration.sql
# Execute in Supabase SQL Editor
```

### 1.3 Verify Migration

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('onboarding_workflows', 'notifications');

-- Check if columns were added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'staff_onboarding_candidates' 
AND column_name = 'workflow_id';

-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_workflow_for_candidate', 'notify_workflow_stage_change');
```

## Step 2: Environment Configuration

### 2.1 Production Environment Variables

Add these to your production environment (Vercel/Netlify):

```bash
# Database
DATABASE_URL=your-production-database-url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration (Choose one)
# Option 1: SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Option 2: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Option 3: Resend
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@domain.com

# Application Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://yourdomain.com

# Optional: Debug Mode
NOTIFICATION_DEBUG=false
```

### 2.2 Environment Validation

Create a validation script to check all required variables:

```typescript
// scripts/validate-env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  // Add email service vars
  // Add SMS service vars
  // Add push notification vars
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are set');
}
```

## Step 3: Code Deployment

### 3.1 Build and Deploy

```bash
# Build the application
npm run build

# Deploy to production
# For Vercel:
vercel --prod

# For Netlify:
netlify deploy --prod

# For other platforms, follow their deployment process
```

### 3.2 Verify Deployment

```bash
# Check if application is running
curl -I https://yourdomain.com

# Check health endpoint
curl https://yourdomain.com/api/health

# Check API endpoints
curl https://yourdomain.com/api/admin/onboarding/workflows
```

## Step 4: Notification Services Setup

### 4.1 Email Service Configuration

#### SendGrid Setup
1. **Verify Domain**
   ```bash
   # Add DNS records as instructed by SendGrid
   # CNAME: s1._domainkey.yourdomain.com
   # CNAME: s2._domainkey.yourdomain.com
   ```

2. **Test Email Sending**
   ```typescript
   // Test email functionality
   const notificationService = new NotificationService();
   await notificationService.sendNotification({
     userId: 'test-user-id',
     type: 'test',
     title: 'Production Test',
     message: 'Testing email delivery in production',
     channels: ['email'],
     priority: 'normal',
   });
   ```

#### SMTP Setup
1. **Configure SMTP Settings**
   - Use production SMTP credentials
   - Test connection before deployment
   - Monitor delivery rates

2. **Test SMTP Connection**
   ```typescript
   // Test SMTP connection
   const transporter = nodemailer.createTransporter({
     host: process.env.SMTP_HOST,
     port: parseInt(process.env.SMTP_PORT || '587'),
     secure: false,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS,
     },
   });
   
   await transporter.verify();
   ```

### 4.2 SMS Service Configuration

#### Twilio Setup
1. **Verify Phone Number**
   - Ensure Twilio phone number is active
   - Test SMS delivery
   - Monitor delivery rates

2. **Test SMS Sending**
   ```typescript
   // Test SMS functionality
   await notificationService.sendNotification({
     userId: 'test-user-id',
     type: 'test',
     title: 'Production Test',
     message: 'Testing SMS delivery in production',
     channels: ['sms'],
     priority: 'high',
   });
   ```

### 4.3 Push Notifications Setup

#### VAPID Keys
1. **Generate Production Keys**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Test Push Notifications**
   ```typescript
   // Test push notification
   await notificationService.sendNotification({
     userId: 'test-user-id',
     type: 'test',
     title: 'Production Test',
     message: 'Testing push notifications in production',
     channels: ['push'],
     priority: 'normal',
   });
   ```

## Step 5: Post-Deployment Verification

### 5.1 System Health Check

Create a comprehensive health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      email: 'unknown',
      sms: 'unknown',
      push: 'unknown',
    },
  };

  try {
    // Test database connection
    const { data } = await supabase.from('onboarding_workflows').select('count').limit(1);
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Test email service
    const notificationService = new NotificationService();
    await notificationService.sendNotification({
      userId: 'health-check',
      type: 'health-check',
      title: 'Health Check',
      message: 'System health check',
      channels: ['email'],
      priority: 'low',
    });
    health.services.email = 'healthy';
  } catch (error) {
    health.services.email = 'unhealthy';
    health.status = 'degraded';
  }

  // Add similar tests for SMS and push

  return Response.json(health);
}
```

### 5.2 Feature Testing

#### Test Onboarding Workflow
1. **Create Test Candidate**
   ```typescript
   // Test adding a candidate
   const response = await fetch('/api/admin/onboarding/add-existing-user', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'test@example.com',
       template_id: 'template-id',
       venue_id: 'venue-id',
     }),
   });
   ```

2. **Test Workflow Progression**
   ```typescript
   // Test advancing workflow
   const response = await fetch('/api/admin/onboarding/workflows/advance', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       workflow_id: 'workflow-id',
       new_stage: 'application_started',
     }),
   });
   ```

3. **Test Notifications**
   - Verify email notifications are sent
   - Verify SMS notifications are delivered
   - Verify push notifications are received

### 5.3 Performance Testing

#### Load Testing
```bash
# Test API endpoints under load
npm install -g artillery
artillery quick --count 100 --num 10 https://yourdomain.com/api/admin/onboarding/workflows
```

#### Database Performance
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM onboarding_workflows WHERE venue_id = 'venue-id';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('onboarding_workflows', 'notifications');
```

## Step 6: Monitoring and Alerting

### 6.1 Application Monitoring

#### Vercel Analytics
- Enable Vercel Analytics
- Monitor page views and performance
- Set up alerts for errors

#### Custom Monitoring
```typescript
// Add monitoring to critical functions
export async function sendNotification(data: NotificationData) {
  const startTime = Date.now();
  
  try {
    const result = await sendNotificationInternal(data);
    
    // Log success
    console.log(`Notification sent successfully in ${Date.now() - startTime}ms`);
    
    return result;
  } catch (error) {
    // Log error
    console.error(`Notification failed after ${Date.now() - startTime}ms:`, error);
    
    // Send alert
    await sendAlert('Notification delivery failed', error);
    
    throw error;
  }
}
```

### 6.2 Database Monitoring

#### Supabase Monitoring
- Monitor database performance
- Set up alerts for high CPU/memory usage
- Track query performance

#### Custom Database Monitoring
```sql
-- Monitor workflow completion rates
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_workflows,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  AVG(CASE WHEN status = 'completed' 
    THEN EXTRACT(EPOCH FROM (actual_completion - created_at))/86400 
    END) as avg_days_to_complete
FROM onboarding_workflows
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

### 6.3 Notification Monitoring

#### Delivery Rate Monitoring
```typescript
// Track notification delivery rates
export async function trackNotificationDelivery(notificationId: string, status: 'delivered' | 'failed') {
  await supabase
    .from('notifications')
    .update({ 
      delivery_status: status,
      delivered_at: status === 'delivered' ? new Date().toISOString() : null,
    })
    .eq('id', notificationId);
}
```

## Step 7: User Communication

### 7.1 Announcement Plan

1. **Pre-Deployment Communication**
   - Email admins about upcoming changes
   - Schedule training sessions
   - Provide documentation links

2. **Deployment Announcement**
   - Send announcement email to all users
   - Post in-app notification
   - Update help documentation

3. **Post-Deployment Support**
   - Monitor support requests
   - Provide additional training if needed
   - Collect feedback for improvements

### 7.2 Training Materials

1. **Admin Training**
   - Schedule admin training sessions
   - Provide admin user guide
   - Create video tutorials

2. **User Training**
   - Send user training guide
   - Create FAQ document
   - Provide support contact information

## Step 8: Rollback Plan

### 8.1 Rollback Triggers

- Critical bugs affecting core functionality
- Performance issues causing system slowdown
- Security vulnerabilities
- Data integrity issues

### 8.2 Rollback Procedure

1. **Immediate Actions**
   ```bash
   # Revert to previous deployment
   vercel rollback
   
   # Or redeploy previous version
   git checkout previous-commit
   vercel --prod
   ```

2. **Database Rollback**
   ```bash
   # Restore database from backup
   supabase db reset --linked
   # Then restore from backup file
   ```

3. **Communication**
   - Notify users of rollback
   - Explain reason and timeline
   - Provide alternative solutions

## Step 9: Post-Deployment Checklist

### 9.1 Verification Checklist
- [ ] All API endpoints responding correctly
- [ ] Database migrations applied successfully
- [ ] Notification services working
- [ ] Workflow system functioning
- [ ] User authentication working
- [ ] File uploads working
- [ ] Email notifications being sent
- [ ] SMS notifications being delivered
- [ ] Push notifications working
- [ ] Analytics tracking enabled
- [ ] Error monitoring configured
- [ ] Performance monitoring active

### 9.2 Documentation Updates
- [ ] Update deployment documentation
- [ ] Update user guides
- [ ] Update admin documentation
- [ ] Update API documentation
- [ ] Update troubleshooting guides

### 9.3 Team Communication
- [ ] Notify development team of deployment
- [ ] Notify support team of new features
- [ ] Schedule post-deployment review
- [ ] Plan next iteration

## Troubleshooting

### Common Deployment Issues

#### Database Migration Failures
```bash
# Check migration status
supabase migration list

# Reset migrations if needed
supabase db reset --linked

# Apply migrations manually
supabase db push --include-all
```

#### Environment Variable Issues
```bash
# Verify environment variables
vercel env ls

# Update environment variables
vercel env add VARIABLE_NAME

# Redeploy after env changes
vercel --prod
```

#### Notification Service Issues
```typescript
// Test notification services individually
const notificationService = new NotificationService();

// Test email
await notificationService.sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  body: 'Test email',
});

// Test SMS
await notificationService.sendSMS({
  to: '+1234567890',
  message: 'Test SMS',
});
```

### Performance Issues

#### Database Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Application Performance
```typescript
// Add performance monitoring
export async function withPerformanceMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    console.log(`${operationName} completed in ${duration}ms`);
    
    // Send to monitoring service if duration is high
    if (duration > 5000) {
      await sendAlert(`${operationName} took ${duration}ms`, { duration });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
}
```

## Conclusion

This deployment guide ensures a smooth transition to the Phase 2 onboarding workflow system. By following these steps carefully and monitoring the system after deployment, you can ensure a successful production launch.

### Key Success Factors

1. **Thorough Testing**: Test all features before deployment
2. **Monitoring**: Set up comprehensive monitoring
3. **Communication**: Keep users informed of changes
4. **Documentation**: Maintain up-to-date documentation
5. **Support**: Provide adequate support during transition

### Next Steps

1. **Monitor System**: Watch for issues in the first 24-48 hours
2. **Gather Feedback**: Collect user feedback and suggestions
3. **Optimize Performance**: Identify and fix performance bottlenecks
4. **Plan Enhancements**: Plan future improvements based on usage
5. **Document Lessons**: Document lessons learned for future deployments

For additional support during deployment, refer to the troubleshooting section or contact the development team. 