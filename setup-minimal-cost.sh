#!/bin/bash

# ============================================
# Yadplast - Minimal Cost Production Setup
# ============================================

set -e

echo "🚀 Yadplast E-Commerce - Minimal Cost Setup"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi
echo -e "${GREEN}✓ pnpm found: $(pnpm --version)${NC}"

# Step 2: Install dependencies
echo ""
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Check for .env.local
echo ""
echo -e "${BLUE}Step 3: Checking environment configuration...${NC}"

if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp .env.integrations.example .env.local
    echo -e "${YELLOW}⚠️  Please edit .env.local with your API keys${NC}"
fi

echo -e "${GREEN}✓ .env.local exists${NC}"

# Step 4: Setup Redis
echo ""
echo -e "${BLUE}Step 4: Setting up Redis...${NC}"

if command -v docker &> /dev/null; then
    echo "Docker found. Setting up Redis container..."
    
    if docker ps | grep -q "yadplast-redis"; then
        echo -e "${GREEN}✓ Redis container already running${NC}"
    else
        echo "Starting Redis container..."
        docker run -d -p 6379:6379 --name yadplast-redis redis:latest
        echo -e "${GREEN}✓ Redis container started${NC}"
    fi
elif command -v redis-server &> /dev/null; then
    echo "Local Redis installation found."
    echo -e "${YELLOW}⚠️  Make sure to run 'redis-server' in another terminal${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not found. Install it with:${NC}"
    echo "   macOS: brew install redis"
    echo "   Ubuntu: sudo apt-get install redis-server"
    echo "   Or use Docker: docker run -d -p 6379:6379 redis:latest"
fi

# Step 5: Test database
echo ""
echo -e "${BLUE}Step 5: Testing database connection...${NC}"

if pnpm prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  Database connection failed${NC}"
    echo "Make sure DATABASE_URL is set correctly in .env.local"
fi

# Step 6: Run tests
echo ""
echo -e "${BLUE}Step 6: Running tests...${NC}"

if pnpm test --passWithNoTests 2>/dev/null; then
    echo -e "${GREEN}✓ Tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed (check configuration)${NC}"
fi

# Step 7: Display configuration
echo ""
echo -e "${BLUE}Step 7: Configuration Summary${NC}"
echo "=================================="
echo ""
echo "📧 Email Service: $(grep -o 'resend\|sendgrid\|mailtrap' .env.local || echo 'NOT SET')"
echo "📱 SMS Service: $(grep -o 'africas-talking\|twilio\|vonage' .env.local || echo 'NOT SET')"
echo "⚡ Cache: $(grep -o 'redis://.*' .env.local || echo 'NOT SET')"
echo ""

# Step 8: Show next steps
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "============="
echo ""
echo "1️⃣  Update .env.local with your API keys:"
echo "   • Resend: https://resend.com → API Keys"
echo "   • Africa's Talking: https://africastalking.com → Settings → API Key"
echo ""
echo "2️⃣  Start the development server:"
echo "   pnpm dev"
echo ""
echo "3️⃣  Run tests:"
echo "   pnpm test"
echo ""
echo "4️⃣  Test email service:"
echo "   pnpm tsx -e \"import { sendEmail } from './lib/email-service'; sendEmail({ to: 'your-email@example.com', subject: 'Test', html: '<p>Works!</p>' })\""
echo ""
echo "5️⃣  Deploy to production:"
echo "   Vercel: vercel"
echo "   Railway: railway link && railway up"
echo "   Render: Push to GitHub, connect repo"
echo ""
echo -e "${YELLOW}💡 Tip: Keep redis-server running in another terminal!${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
