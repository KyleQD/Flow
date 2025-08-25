#!/bin/bash

# 🚀 Tourify Deployment Script
# Supports both demo and production deployments

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_NAME="tourify"
PRODUCTION_DOMAIN="tourify.live"
DEMO_DOMAIN="demo.tourify.live"
PRODUCTION_PORT=3000
DEMO_PORT=3001

print_status() {
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

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  deploy     Deploy the application"
    echo "  build      Build the application"
    echo "  start      Start the application"
    echo "  stop       Stop the application"
    echo "  restart    Restart the application"
    echo "  status     Show deployment status"
    echo "  logs       Show application logs"
    echo "  setup      Initial setup"
    echo ""
    echo "Environments:"
    echo "  production Deploy to production (default)"
    echo "  demo       Deploy to demo environment"
    echo ""
    echo "Examples:"
    echo "  $0 deploy production"
    echo "  $0 deploy demo"
    echo "  $0 build demo"
    echo "  $0 status"
}

# Function to validate environment
validate_environment() {
    local env=$1
    
    if [[ "$env" != "production" && "$env" != "demo" ]]; then
        print_error "Invalid environment: $env"
        echo "Valid environments: production, demo"
        exit 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $node_version -lt 18 ]]; then
        print_error "Node.js 18 or higher is required"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup environment file
setup_environment() {
    local env=$1
    
    print_status "Setting up environment for $env..."
    
    if [[ "$env" == "production" ]]; then
        if [[ ! -f "deployment/production.env" ]]; then
            print_error "Production environment file not found: deployment/production.env"
            exit 1
        fi
        cp deployment/production.env .env.production
        print_success "Production environment configured"
    else
        if [[ ! -f "deployment/demo.env" ]]; then
            print_error "Demo environment file not found: deployment/demo.env"
            exit 1
        fi
        cp deployment/demo.env .env.demo
        print_success "Demo environment configured"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Clean install for production
    npm ci --production=false
    
    print_success "Dependencies installed"
}

# Function to build application
build_application() {
    local env=$1
    
    print_status "Building application for $env..."
    
    # Set environment variables
    if [[ "$env" == "production" ]]; then
        export NODE_ENV=production
        export NEXT_PUBLIC_SITE_URL=https://$PRODUCTION_DOMAIN
        npm run build
    else
        export NODE_ENV=production
        export NEXT_PUBLIC_SITE_URL=https://$DEMO_DOMAIN
        export NEXT_PUBLIC_DEMO_MODE=true
        npm run build
    fi
    
    print_success "Application built successfully"
}

# Function to start application
start_application() {
    local env=$1
    
    print_status "Starting $env application..."
    
    if [[ "$env" == "production" ]]; then
        export NODE_ENV=production
        export PORT=$PRODUCTION_PORT
        nohup npm start > logs/production.log 2>&1 &
        echo $! > .production.pid
        print_success "Production application started on port $PRODUCTION_PORT"
    else
        export NODE_ENV=production
        export PORT=$DEMO_PORT
        export NEXT_PUBLIC_DEMO_MODE=true
        nohup npm start > logs/demo.log 2>&1 &
        echo $! > .demo.pid
        print_success "Demo application started on port $DEMO_PORT"
    fi
}

# Function to stop application
stop_application() {
    local env=$1
    
    print_status "Stopping $env application..."
    
    if [[ "$env" == "production" ]]; then
        if [[ -f ".production.pid" ]]; then
            local pid=$(cat .production.pid)
            if kill -0 $pid 2>/dev/null; then
                kill $pid
                rm .production.pid
                print_success "Production application stopped"
            else
                print_warning "Production application was not running"
                rm .production.pid
            fi
        else
            print_warning "Production application was not running"
        fi
    else
        if [[ -f ".demo.pid" ]]; then
            local pid=$(cat .demo.pid)
            if kill -0 $pid 2>/dev/null; then
                kill $pid
                rm .demo.pid
                print_success "Demo application stopped"
            else
                print_warning "Demo application was not running"
                rm .demo.pid
            fi
        else
            print_warning "Demo application was not running"
        fi
    fi
}

# Function to check application status
check_status() {
    local env=$1
    
    if [[ "$env" == "production" ]]; then
        if [[ -f ".production.pid" ]]; then
            local pid=$(cat .production.pid)
            if kill -0 $pid 2>/dev/null; then
                print_success "Production application is running (PID: $pid)"
                return 0
            else
                print_warning "Production application is not running"
                rm .production.pid
                return 1
            fi
        else
            print_warning "Production application is not running"
            return 1
        fi
    else
        if [[ -f ".demo.pid" ]]; then
            local pid=$(cat .demo.pid)
            if kill -0 $pid 2>/dev/null; then
                print_success "Demo application is running (PID: $pid)"
                return 0
            else
                print_warning "Demo application is not running"
                rm .demo.pid
                return 1
            fi
        else
            print_warning "Demo application is not running"
            return 1
        fi
    fi
}

# Function to show logs
show_logs() {
    local env=$1
    
    if [[ "$env" == "production" ]]; then
        if [[ -f "logs/production.log" ]]; then
            tail -f logs/production.log
        else
            print_warning "No production logs found"
        fi
    else
        if [[ -f "logs/demo.log" ]]; then
            tail -f logs/demo.log
        else
            print_warning "No demo logs found"
        fi
    fi
}

# Function to deploy application
deploy_application() {
    local env=$1
    
    print_status "Deploying $env application..."
    
    # Stop existing application
    stop_application $env
    
    # Setup environment
    setup_environment $env
    
    # Install dependencies
    install_dependencies
    
    # Build application
    build_application $env
    
    # Create logs directory
    mkdir -p logs
    
    # Start application
    start_application $env
    
    # Wait a moment and check status
    sleep 3
    if check_status $env; then
        if [[ "$env" == "production" ]]; then
            print_success "Production deployment completed!"
            print_success "Application available at: https://$PRODUCTION_DOMAIN"
        else
            print_success "Demo deployment completed!"
            print_success "Application available at: https://$DEMO_DOMAIN"
        fi
    else
        print_error "Deployment failed - application is not running"
        exit 1
    fi
}

# Function to setup initial environment
setup_initial() {
    print_status "Setting up initial deployment environment..."
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p deployment
    
    # Check if environment files exist
    if [[ ! -f "deployment/production.env" ]]; then
        print_error "Production environment file not found"
        print_status "Please create deployment/production.env with your configuration"
        exit 1
    fi
    
    if [[ ! -f "deployment/demo.env" ]]; then
        print_error "Demo environment file not found"
        print_status "Please create deployment/demo.env with your configuration"
        exit 1
    fi
    
    print_success "Initial setup completed"
}

# Main script logic
main() {
    local command=$1
    local environment=${2:-production}
    
    # Show usage if no command provided
    if [[ -z "$command" ]]; then
        show_usage
        exit 1
    fi
    
    # Handle help command
    if [[ "$command" == "help" || "$command" == "--help" || "$command" == "-h" ]]; then
        show_usage
        exit 0
    fi
    
    # Validate environment
    validate_environment $environment
    
    # Check prerequisites
    check_prerequisites
    
    # Execute command
    case $command in
        "deploy")
            deploy_application $environment
            ;;
        "build")
            setup_environment $environment
            install_dependencies
            build_application $environment
            ;;
        "start")
            setup_environment $environment
            start_application $environment
            ;;
        "stop")
            stop_application $environment
            ;;
        "restart")
            stop_application $environment
            sleep 2
            setup_environment $environment
            start_application $environment
            ;;
        "status")
            check_status $environment
            ;;
        "logs")
            show_logs $environment
            ;;
        "setup")
            setup_initial
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
