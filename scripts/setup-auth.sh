#!/bin/bash

# Tourify Authentication Setup Script
# This script helps automate the Supabase authentication configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
ARROW="➡️"
ROCKET="🚀"
GEAR="⚙️"
BOOK="📚"

print_header() {
    echo -e "${PURPLE}${1}${NC}"
}

print_step() {
    echo -e "${BLUE}${ARROW} ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK} ${1}${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  ${1}${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  ${1}${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_header "🔍 Checking Dependencies"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    print_success "Node.js found: $(node --version)"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_success "npm found: $(npm --version)"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    print_success "Project structure verified"
}

# Install required dependencies
install_dependencies() {
    print_header "📦 Installing Dependencies"
    
    print_step "Installing Supabase SSR package..."
    npm install @supabase/ssr
    
    print_step "Installing testing dependencies..."
    npm install --save-dev chalk tsx @types/node
    
    print_success "Dependencies installed successfully"
}

# Check environment variables
check_environment() {
    print_header "🔐 Checking Environment Variables"
    
    if [ ! -f ".env.local" ]; then
        print_warning "No .env.local file found. Creating template..."
        cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Authentication Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Social Authentication (optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
EOF
        print_info "Created .env.local template. Please update with your actual values."
        return 1
    fi
    
    # Check if variables are set
    source .env.local
    
    if [[ "$NEXT_PUBLIC_SUPABASE_URL" == "your_supabase_project_url_here" ]]; then
        print_warning "Please update NEXT_PUBLIC_SUPABASE_URL in .env.local"
        return 1
    fi
    
    if [[ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == "your_supabase_anon_key_here" ]]; then
        print_warning "Please update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
        return 1
    fi
    
    print_success "Environment variables configured"
    return 0
}

# Test the database connection
test_database() {
    print_header "🗄️ Testing Database Connection"
    
    if check_environment; then
        print_step "Running database connection test..."
        
        # Create a simple test script
        cat > /tmp/test-db.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.log('❌ Database connection failed:', error.message);
            process.exit(1);
        } else {
            console.log('✅ Database connection successful');
        }
    } catch (err) {
        console.log('❌ Connection error:', err.message);
        process.exit(1);
    }
}

testConnection();
EOF
        
        if node /tmp/test-db.js; then
            print_success "Database connection successful"
        else
            print_error "Database connection failed. Please check your Supabase configuration."
            return 1
        fi
        
        rm /tmp/test-db.js
    else
        print_warning "Skipping database test - environment not configured"
    fi
}

# Run the authentication tests
run_auth_tests() {
    print_header "🧪 Running Authentication Tests"
    
    if check_environment; then
        print_step "Running comprehensive authentication tests..."
        
        if npx tsx scripts/test-auth-flows.ts; then
            print_success "All authentication tests passed!"
        else
            print_error "Some authentication tests failed. Check the output above."
            return 1
        fi
    else
        print_warning "Skipping auth tests - environment not configured"
    fi
}

# Build the project
build_project() {
    print_header "🏗️ Building Project"
    
    print_step "Running Next.js build..."
    
    if npm run build; then
        print_success "Project built successfully"
    else
        print_error "Build failed. Check the errors above."
        return 1
    fi
}

# Display setup instructions
show_instructions() {
    print_header "📋 Next Steps"
    
    echo ""
    echo -e "${CYAN}1. Configure Supabase Project:${NC}"
    echo "   ${ARROW} Go to your Supabase Dashboard"
    echo "   ${ARROW} Configure Auth settings (see docs/supabase-setup-guide.md)"
    echo "   ${ARROW} Set up email templates"
    echo "   ${ARROW} Configure SMTP settings"
    echo ""
    
    echo -e "${CYAN}2. Update Environment Variables:${NC}"
    echo "   ${ARROW} Edit .env.local with your actual Supabase credentials"
    echo "   ${ARROW} Add your domain URLs for production"
    echo ""
    
    echo -e "${CYAN}3. Run Database Setup:${NC}"
    echo "   ${ARROW} Copy contents of complete_database_setup.sql"
    echo "   ${ARROW} Run in Supabase SQL Editor"
    echo ""
    
    echo -e "${CYAN}4. Test Everything:${NC}"
    echo "   ${ARROW} npm run dev (start development server)"
    echo "   ${ARROW} npx tsx scripts/test-auth-flows.ts (run auth tests)"
    echo "   ${ARROW} Visit http://localhost:3000/auth/signin"
    echo ""
    
    echo -e "${GREEN}📚 Documentation:${NC}"
    echo "   ${ARROW} Setup Guide: docs/supabase-setup-guide.md"
    echo "   ${ARROW} README: README.md"
    echo ""
}

# Main execution
main() {
    echo ""
    print_header "🎵 Tourify Authentication Setup ${ROCKET}"
    echo ""
    
    # Run setup steps
    check_dependencies
    echo ""
    
    install_dependencies
    echo ""
    
    if check_environment; then
        test_database
        echo ""
        
        run_auth_tests
        echo ""
        
        build_project
        echo ""
        
        print_success "Setup completed successfully! 🎉"
    else
        print_warning "Environment configuration needed"
    fi
    
    echo ""
    show_instructions
}

# Handle script arguments
case "${1:-}" in
    "deps")
        check_dependencies
        install_dependencies
        ;;
    "env")
        check_environment
        ;;
    "test")
        run_auth_tests
        ;;
    "build")
        build_project
        ;;
    "db")
        test_database
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deps    Install dependencies only"
        echo "  env     Check environment variables"
        echo "  test    Run authentication tests"
        echo "  build   Build the project"
        echo "  db      Test database connection"
        echo "  help    Show this help message"
        echo ""
        echo "Run without arguments to perform full setup"
        ;;
    *)
        main
        ;;
esac 