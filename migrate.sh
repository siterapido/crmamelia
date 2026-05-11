#!/bin/bash

# ============================================
# MIGRATION SCRIPT - AMELIA SAUDE
# Database: PostgreSQL (Neon)
# ORM: Drizzle
# Date: 2026-01-30
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js >= 18.17.0"
        exit 1
    fi

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed. Please install pnpm >= 8.0.0"
        exit 1
    fi

    log_success "All prerequisites installed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    if [ ! -d "node_modules" ]; then
        pnpm install
        log_success "Dependencies installed"
    else
        log_info "Dependencies already installed. Skipping..."
    fi
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."

    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            log_warning ".env.local created from .env.example. Please configure DATABASE_URL!"
        else
            log_error ".env.example not found!"
            exit 1
        fi
    fi

    # Load environment variables
    if [ -f ".env.local" ]; then
        export $(grep -v '^#' .env.local | xargs)
        log_success "Environment variables loaded"
    fi
}

# Check database connection
check_database() {
    log_info "Checking database connection..."

    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL is not set in .env.local"
        exit 1
    fi

    # Test connection
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            log_success "Database connection successful"
        else
            log_error "Could not connect to database. Please check DATABASE_URL"
            exit 1
        fi
    else
        log_warning "psql not found. Skipping database connection check."
    fi
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."

    if [ -f "drizzle.config.ts" ]; then
        # Check if drizzle-kit is installed
        if ! pnpm drizzle-kit --version &> /dev/null; then
            log_info "Installing drizzle-kit..."
            pnpm add -D drizzle-kit
        fi

        # Run migration
        pnpm drizzle-kit migrate
        log_success "Migrations executed successfully"
    elif [ -d "drizzle" ] && [ -f "drizzle/001_initial_schema.sql" ]; then
        # Manual migration
        if command -v psql &> /dev/null; then
            psql "$DATABASE_URL" -f drizzle/001_initial_schema.sql
            log_success "SQL migration executed successfully"
        else
            log_error "psql not found. Cannot execute SQL migration"
            exit 1
        fi
    else
        log_warning "No migrations found. Skipping..."
    fi
}

# Seed database
seed_database() {
    log_info "Seeding database..."

    if [ -f "lib/db/seed.ts" ]; then
        pnpm tsx lib/db/seed.ts
        log_success "Database seeded successfully"
    else
        log_warning "Seed file not found. Skipping..."
    fi
}

# Build project
build_project() {
    log_info "Building project..."

    pnpm build
    log_success "Project built successfully"
}

# Start development server
start_dev_server() {
    log_info "Starting development server..."
    log_success "Development server started at http://localhost:3000"
    log_info "Admin panel: http://localhost:3000/admin"
    log_info "Default credentials: admin@ameliasaude.com.br / admin123"

    pnpm dev
}

# Full migration
full_migration() {
    log_info "Starting full migration process..."
    echo ""

    check_prerequisites
    install_dependencies
    setup_environment
    check_database
    run_migrations
    seed_database

    echo ""
    log_success "Migration completed successfully!"
    echo ""
    log_info "Next steps:"
    echo "  1. Configure DATABASE_URL in .env.local"
    echo "  2. Update admin credentials"
    echo "  3. Run 'pnpm dev' to start development server"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo "=========================================="
    echo "  AMELIA SAUDE - MIGRATION SCRIPT"
    echo "=========================================="
    echo ""
    echo "1. Full Migration (recommended for new setup)"
    echo "2. Install Dependencies"
    echo "3. Setup Environment"
    echo "4. Run Migrations"
    echo "5. Seed Database"
    echo "6. Build Project"
    echo "7. Start Development Server"
    echo "8. Exit"
    echo ""
    read -p "Select option (1-8): " choice

    case $choice in
        1)
            full_migration
            ;;
        2)
            install_dependencies
            ;;
        3)
            setup_environment
            ;;
        4)
            run_migrations
            ;;
        5)
            seed_database
            ;;
        6)
            build_project
            ;;
        7)
            start_dev_server
            ;;
        8)
            log_info "Exiting..."
            exit 0
            ;;
        *)
            log_error "Invalid option"
            exit 1
            ;;
    esac
}

# Command line arguments
case "${1:-}" in
    --full)
        full_migration
        ;;
    --install)
        install_dependencies
        ;;
    --env)
        setup_environment
        ;;
    --migrate)
        run_migrations
        ;;
    --seed)
        seed_database
        ;;
    --build)
        build_project
        ;;
    --dev)
        start_dev_server
        ;;
    --help)
        echo "Usage: ./migrate.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  --full      Run full migration (default)"
        echo "  --install   Install dependencies"
        echo "  --env       Setup environment"
        echo "  --migrate   Run database migrations"
        echo "  --seed      Seed database"
        echo "  --build     Build project"
        echo "  --dev       Start development server"
        echo "  --help      Show this help message"
        exit 0
        ;;
    *)
        show_menu
        ;;
esac
