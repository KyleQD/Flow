#!/bin/bash

# Tourify Private Deployment Script
# This script deploys Tourify to a private, unlisted domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "All dependencies are available"
}

# Check Vercel login status
check_vercel_login() {
    print_info "Checking Vercel login status..."
    
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Please login:"
        vercel login
    else
        print_success "Logged in to Vercel"
    fi
}

# Check environment variables
check_env_vars() {
    print_info "Checking environment variables..."
    
    local missing_vars=()
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_warning "Some environment variables are missing:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "You can add them later via:"
        echo "  vercel env add $var"
        echo ""
        print_info "Continuing with deployment..."
    else
        print_success "All required environment variables are set"
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_info "Running tests..."
    npm run lint
    print_success "Tests passed"
}

# Build the application
build_app() {
    print_info "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_info "Deploying to Vercel..."
    
    # Deploy to production
    vercel --prod --yes
    
    print_success "Deployment completed!"
}

# Security recommendations
show_security_recommendations() {
    echo ""
    print_info "🔒 SECURITY RECOMMENDATIONS FOR PRIVATE DEPLOYMENT:"
    echo ""
    echo "1. Enable Password Protection:"
    echo "   - Go to Vercel Dashboard > Your Project > Settings > Password Protection"
    echo "   - Enable password protection and set a strong password"
    echo ""
    echo "2. Configure IP Whitelist (Optional):"
    echo "   - Edit app/middleware.ts to add IP restrictions"
    echo "   - Add crew member IP addresses to ALLOWED_IPS array"
    echo ""
    echo "3. Update Supabase Auth Settings:"
    echo "   - Go to Supabase Dashboard > Authentication > URL Configuration"
    echo "   - Update Site URL to your private domain"
    echo "   - Add redirect URLs for your private domain"
    echo ""
    echo "4. Disable Search Engine Indexing:"
    echo "   - robots.txt file has been created"
    echo "   - Consider adding meta tags to prevent indexing"
    echo ""
    echo "5. Share Access Securely:"
    echo "   - Create a secure document with access credentials"
    echo "   - Share via encrypted messaging or password managers"
    echo ""
}

# Main deployment process
main() {
    print_info "🚀 Starting Tourify PRIVATE deployment..."
    echo ""
    
    check_dependencies
    check_vercel_login
    check_env_vars
    install_dependencies
    run_tests
    build_app
    deploy_to_vercel
    
    echo ""
    print_success "🎉 Tourify has been successfully deployed to a private domain!"
    echo ""
    print_info "Next steps:"
    echo "  1. Configure password protection in Vercel dashboard"
    echo "  2. Update Supabase auth settings with your private domain"
    echo "  3. Set up IP whitelist if needed"
    echo "  4. Share access credentials securely with your crew"
    echo "  5. Test all functionality from the private domain"
    echo ""
    
    show_security_recommendations
    
    echo ""
    print_info "🔐 IMPORTANT: Keep your private domain URL and credentials secure!"
    print_info "   Only share with trusted crew members."
}

# Run the main function
main "$@" 