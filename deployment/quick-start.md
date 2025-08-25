# ⚡ Tourify Quick Start Deployment

Get Tourify deployed in under 10 minutes!

## 🚀 Immediate Deployment

### Step 1: Configure Environment (2 minutes)

1. **Copy environment templates:**
```bash
cp deployment/production.env .env.production
cp deployment/demo.env .env.demo
```

2. **Update Supabase credentials in both files:**
```bash
# Edit .env.production and .env.demo
NEXT_PUBLIC_SUPABASE_URL=https://auqddrodjezjlypkzfpi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_key
```

### Step 2: Deploy Production (3 minutes)

```bash
# Deploy to production
npm run deploy:production

# Or use the script directly
./scripts/deploy.sh deploy production
```

### Step 3: Deploy Demo (3 minutes)

```bash
# Deploy to demo
npm run deploy:demo

# Or use the script directly
./scripts/deploy.sh deploy demo
```

## ✅ Verify Deployment

### Check Production
```bash
# Check status
npm run deploy:status:production

# View logs
npm run deploy:logs:production

# Health check
curl http://localhost:3000/api/health
```

### Check Demo
```bash
# Check status
npm run deploy:status:demo

# View logs
npm run deploy:logs:demo

# Health check
curl http://localhost:3001/api/health
```

## 🌐 Access Your Applications

- **Production**: http://localhost:3000
- **Demo**: http://localhost:3001

## 🔧 Quick Commands

```bash
# Start both environments
npm run deploy:start:production
npm run deploy:start:demo

# Stop both environments
npm run deploy:stop:production
npm run deploy:stop:demo

# Restart both environments
npm run deploy:restart:production
npm run deploy:restart:demo

# View both logs
npm run deploy:logs:production
npm run deploy:logs:demo
```

## 🎯 What's Deployed

### Production Features
- ✅ Full Tourify platform
- ✅ Real authentication
- ✅ Complete feature set
- ✅ Performance optimized
- ✅ Production ready

### Demo Features
- ✅ Demo mode banner
- ✅ Limited functionality
- ✅ Demo data
- ✅ Demo user creation
- ✅ Data reset capability

## 🚨 Troubleshooting

### If deployment fails:
```bash
# Clear everything and retry
rm -rf .next
rm -rf node_modules
npm install
npm run deploy:production
```

### If ports are in use:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001

# Kill conflicting processes
kill -9 <PID>
```

### If environment issues:
```bash
# Verify environment files
ls -la .env*
cat .env.production
cat .env.demo
```

## 🎉 Success!

Your Tourify applications are now running:
- **Production**: http://localhost:3000
- **Demo**: http://localhost:3001

Both applications are ready for:
- ✅ User testing
- ✅ Feature demonstrations
- ✅ Investor presentations
- ✅ Beta user onboarding
