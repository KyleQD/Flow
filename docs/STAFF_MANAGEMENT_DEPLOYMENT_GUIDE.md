# Staff Management System - Deployment Guide

## 🚀 **Deployment Overview**

This guide covers the complete deployment process for the Staff Management System, from staging to production.

## 📋 **Prerequisites**

### **System Requirements**
- **Node.js**: Version 18+ 
- **npm**: Version 9+
- **Git**: Version 2.30+
- **Supabase Account**: Active Supabase project
- **Vercel Account**: For production deployment (optional)

### **Environment Setup**
```bash
# Clone the repository
git clone https://github.com/your-org/tourify-beta-K2.git
cd tourify-beta-K2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_nextauth_secret

# Database Configuration
DATABASE_URL=your_database_url

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### **Supabase Setup**
1. **Create Supabase Project**
   ```bash
   # Navigate to Supabase dashboard
   # Create new project
   # Note down URL and keys
   ```

2. **Run Database Migrations**
   ```bash
   # Apply staff management migrations
   npx supabase db push
   
   # Or run SQL files manually
   psql -h your_host -U your_user -d your_db -f scripts/enhanced-staff-management-migration.sql
   ```

3. **Set up Row Level Security**
   ```sql
   -- Enable RLS on all staff management tables
   ALTER TABLE admin_onboarding_candidates ENABLE ROW LEVEL SECURITY;
   ALTER TABLE admin_job_postings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE admin_job_applications ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can access their venue data" ON admin_onboarding_candidates
     FOR ALL USING (venue_id IN (
       SELECT venue_id FROM user_venues WHERE user_id = auth.uid()
     ));
   ```

## 🧪 **Staging Deployment**

### **Local Testing**
```bash
# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Start production server locally
npm start
```

### **Staging Environment**
```bash
# Deploy to staging (Vercel)
vercel --prod

# Or deploy to your staging server
npm run build
npm run start
```

### **Staging Validation**
1. **Functional Testing**
   - [ ] All pages load correctly
   - [ ] Authentication works
   - [ ] All enhanced components render
   - [ ] API endpoints respond
   - [ ] Database operations work

2. **Performance Testing**
   - [ ] Page load times < 2 seconds
   - [ ] API response times < 500ms
   - [ ] Memory usage < 200MB
   - [ ] No memory leaks

3. **Security Testing**
   - [ ] Authentication required for protected routes
   - [ ] Data validation working
   - [ ] Input sanitization active
   - [ ] RLS policies enforced

## 🚀 **Production Deployment**

### **Production Build**
```bash
# Create production build
npm run build

# Test production build locally
npm start
```

### **Vercel Deployment**
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### **Custom Server Deployment**
```bash
# Build application
npm run build

# Copy files to server
scp -r .next user@your-server:/path/to/app

# Start production server
npm start
```

## 📊 **Post-Deployment Monitoring**

### **Health Checks**
```bash
# Check application status
curl -f http://your-domain.com/api/health

# Check database connection
curl -f http://your-domain.com/api/admin/dashboard/stats?venue_id=test

# Monitor logs
tail -f /var/log/application.log
```

### **Performance Monitoring**
- **Page Load Times**: Monitor with Google PageSpeed Insights
- **API Response Times**: Track with application monitoring
- **Database Performance**: Monitor with Supabase dashboard
- **Error Rates**: Track with error monitoring service

### **Security Monitoring**
- **Authentication Logs**: Monitor login attempts
- **API Usage**: Track API call patterns
- **Data Access**: Monitor database queries
- **Error Logs**: Review security-related errors

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Workflow**
```yaml
name: Deploy Staff Management System

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to staging
        if: github.ref == 'refs/heads/main'
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."
          
      - name: Deploy to production
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          # Deploy to production environment
          echo "Deploying to production..."
```

### **Automated Testing**
```bash
# Run all tests before deployment
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🚨 **Rollback Procedures**

### **Emergency Rollback**
```bash
# Revert to previous version
git revert HEAD

# Rebuild and redeploy
npm run build
npm start

# Or rollback database changes
psql -h your_host -U your_user -d your_db -f rollback.sql
```

### **Database Rollback**
```sql
-- Rollback staff management tables
DROP TABLE IF EXISTS admin_job_applications;
DROP TABLE IF EXISTS admin_job_postings;
DROP TABLE IF EXISTS admin_onboarding_workflows;
DROP TABLE IF EXISTS admin_onboarding_candidates;
```

## 📈 **Performance Optimization**

### **Build Optimization**
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Optimize images
npm run optimize-images

# Compress assets
npm run compress-assets
```

### **Runtime Optimization**
- **Caching**: Implement Redis caching
- **CDN**: Use CDN for static assets
- **Database**: Optimize queries and indexes
- **Monitoring**: Set up performance alerts

## 🔐 **Security Checklist**

### **Pre-Deployment**
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] RLS policies configured
- [ ] Authentication working
- [ ] Input validation active
- [ ] Error handling implemented

### **Post-Deployment**
- [ ] SSL certificate active
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring active
- [ ] Backup procedures tested
- [ ] Incident response plan ready

## 📞 **Support & Maintenance**

### **Monitoring Tools**
- **Application Monitoring**: Vercel Analytics, Sentry
- **Database Monitoring**: Supabase Dashboard
- **Performance Monitoring**: Google PageSpeed Insights
- **Error Tracking**: Sentry, LogRocket

### **Maintenance Schedule**
- **Daily**: Check application health
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit

### **Support Contacts**
- **Technical Issues**: development@tourify.com
- **User Support**: support@tourify.com
- **Emergency**: emergency@tourify.com

## 📚 **Additional Resources**

### **Documentation**
- [User Guide](./STAFF_MANAGEMENT_USER_GUIDE.md)
- [Technical Documentation](./STAFF_MANAGEMENT_TECHNICAL_DOCS.md)
- [API Documentation](./API_DOCUMENTATION.md)

### **Tools & Services**
- **Vercel**: https://vercel.com
- **Supabase**: https://supabase.com
- **GitHub**: https://github.com
- **Sentry**: https://sentry.io

---

**Last Updated**: January 2024
**Version**: 1.0
**System**: Staff Management Platform 