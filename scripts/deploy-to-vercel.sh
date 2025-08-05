#!/bin/bash

# Tourify Vercel Deployment Script
# This script prepares and deploys the Tourify platform to Vercel

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
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please set these variables in your Vercel project settings:"
        echo "  vercel env add NEXT_PUBLIC_SUPABASE_URL"
        echo "  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "  vercel env add SUPABASE_SERVICE_ROLE_KEY"
        exit 1
    fi
    
    print_success "All required environment variables are set"
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
    
    # Check if already logged in
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Please login:"
        vercel login
    fi
    
    # Deploy to production
    vercel --prod --yes
    
    print_success "Deployment completed!"
}

# Main deployment process
main() {
    print_info "Starting Tourify deployment to Vercel..."
    echo ""
    
    check_dependencies
    check_env_vars
    install_dependencies
    run_tests
    build_app
    deploy_to_vercel
    
    echo ""
    print_success "Tourify has been successfully deployed to Vercel!"
    print_info "Next steps:"
    echo "  1. Configure your custom domain (optional)"
    echo "  2. Set up monitoring and analytics"
    echo "  3. Test all functionality in production"
    echo "  4. Configure any additional environment variables"
}

# Run the main function
main "$@" 