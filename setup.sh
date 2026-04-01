#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────
# Souqona — Project Initialization Script
# ──────────────────────────────────────────────────

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log()  { echo -e "${BLUE}[Souqona]${NC} $1"; }
done() { echo -e "${GREEN}  ✔${NC} $1"; }
warn() { echo -e "${YELLOW}  ⚠${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     Souqona — Project Initialization     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Install Next.js frontend dependencies ────
log "Installing Next.js frontend dependencies..."
cd apps/web
npm install
done "Frontend dependencies installed"
cd "$SCRIPT_DIR"

# ── 2. Install Node.js backend dependencies ─────
log "Installing Node.js backend dependencies..."
cd apps/server
npm install
done "Backend dependencies installed"

# ── 3. Initialize Prisma ────────────────────────
log "Generating Prisma client..."
npx prisma generate
done "Prisma client generated"
cd "$SCRIPT_DIR"

# ── 4. Environment file ─────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  done "Created .env from .env.example"
else
  done ".env already exists — skipping"
fi

# ── 5. Summary ──────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║          Setup Complete!                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""
log "Next steps:"
echo ""
echo "  Local development:"
echo "    npm run dev:server   # Start the API on :3001"
echo "    npm run dev:web      # Start the frontend on :3000"
echo ""
echo "  Docker (recommended):"
echo "    npm run docker:up    # Build & start all services"
echo "    npm run docker:down  # Stop all services"
echo ""
echo "  Database:"
echo "    npm run db:migrate   # Run Prisma migrations"
echo "    npm run db:studio    # Open Prisma Studio"
echo ""
