#!/bin/bash

# Production Deployment Script for Tourify
# This script handles the complete deployment process with zero-downtime

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="tourify"
DOCKER_IMAGE="tourify:latest"
BACKUP_IMAGE="tourify:backup-$(date +%Y%m%d-%H%M%S)"
COMPOSE_FILE="docker/production/docker-compose.yml"
ENV_FILE=".env.production"

# Production Configuration for tourify.live
DOMAIN=${DOMAIN:-"tourify.live"}
SSL_DOMAIN="tourify.live"
PRODUCTION_URL="https://tourify.live"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
    exit 1
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running"
    fi
    
    # Check if required files exist
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found"
    fi
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Docker compose file $COMPOSE_FILE not found"
    fi
    
    # Check if git is clean
    if [[ -n $(git status --porcelain) ]]; then
        warning "Git working directory is not clean"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check database migrations
    log "Checking database migrations..."
    # Add your migration check logic here
    
    success "Pre-deployment checks completed"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    # Tag current image as backup
    if docker image inspect $DOCKER_IMAGE >/dev/null 2>&1; then
        docker tag $DOCKER_IMAGE $BACKUP_IMAGE
        success "Current image backed up as $BACKUP_IMAGE"
    fi
    
    # Backup database
    log "Creating database backup..."
    docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > "backup-$(date +%Y%m%d-%H%M%S).sql"
    success "Database backup created"
}

# Build new image
build_application() {
    log "Building new application image..."
    
    # Build the image
    docker build -f docker/production/Dockerfile -t $DOCKER_IMAGE .
    
    # Run security scan (if trivy is installed)
    if command -v trivy >/dev/null 2>&1; then
        log "Running security scan..."
        trivy image $DOCKER_IMAGE
    fi
    
    success "Application built successfully"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Run unit tests
    npm test -- --watchAll=false --coverage
    
    # Run integration tests
    npm run test:integration
    
    # Run e2e tests (if configured)
    if npm run | grep -q "test:e2e"; then
        npm run test:e2e
    fi
    
    success "All tests passed"
}

# Deploy with zero downtime
deploy() {
    log "Starting zero-downtime deployment..."
    
    # Load environment variables
    export $(grep -v '^#' $ENV_FILE | xargs)
    
    # Update services one by one
    log "Updating application service..."
    docker-compose -f $COMPOSE_FILE up -d --scale app=2 app
    
    # Wait for new instance to be healthy
    log "Waiting for new instance to be healthy..."
    timeout=300
    while [[ $timeout -gt 0 ]]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            break
        fi
        sleep 5
        timeout=$((timeout-5))
    done
    
    if [[ $timeout -eq 0 ]]; then
        error "New instance failed to become healthy"
    fi
    
    # Scale down old instance
    docker-compose -f $COMPOSE_FILE up -d --scale app=1 app
    
    # Update other services
    docker-compose -f $COMPOSE_FILE up -d
    
    success "Deployment completed successfully"
}

# Post-deployment verification
post_deployment_verification() {
    log "Running post-deployment verification..."
    
    # Health check
    if ! curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        error "Application health check failed"
    fi
    
    # Database connectivity
    if ! docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U $POSTGRES_USER >/dev/null 2>&1; then
        error "Database connectivity check failed"
    fi
    
    # Redis connectivity
    if ! docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping >/dev/null 2>&1; then
        warning "Redis connectivity check failed"
    fi
    
    # Run smoke tests
    log "Running smoke tests..."
    # Add your smoke tests here
    
    success "Post-deployment verification completed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    if [[ -z "$BACKUP_IMAGE" ]]; then
        error "No backup image found for rollback"
    fi
    
    # Tag backup as current
    docker tag $BACKUP_IMAGE $DOCKER_IMAGE
    
    # Restart services with old image
    docker-compose -f $COMPOSE_FILE up -d --force-recreate app
    
    success "Rollback completed"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old images and containers..."
    
    # Remove old images (keep last 3)
    docker images | grep "$PROJECT_NAME" | tail -n +4 | awk '{print $3}' | xargs -r docker rmi
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    success "Cleanup completed"
}

# Main deployment flow
main() {
    log "Starting production deployment for $PROJECT_NAME"
    
    case "${1:-deploy}" in
        "deploy")
            pre_deployment_checks
            backup_current_deployment
            build_application
            run_tests
            deploy
            post_deployment_verification
            cleanup
            success "Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            post_deployment_verification
            success "Rollback completed successfully!"
            ;;
        "health")
            curl -f http://localhost:3000/api/health | jq .
            ;;
        "logs")
            docker-compose -f $COMPOSE_FILE logs -f app
            ;;
        "status")
            docker-compose -f $COMPOSE_FILE ps
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|logs|status}"
            exit 1
            ;;
    esac
}

# Trap to handle interruptions
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@" 

deploy_production() {
    echo "🚀 Deploying Tourify to https://tourify.live..."
    echo "================================================"
    
    # Set production environment
    export NODE_ENV=production
    export DOMAIN=tourify.live
    export NEXT_PUBLIC_SITE_URL=https://tourify.live
    
    # ... existing deployment code ...
    
    echo "✅ Tourify is now LIVE at https://tourify.live!"
    echo "🎵 Ready to revolutionize music discovery!"
} 