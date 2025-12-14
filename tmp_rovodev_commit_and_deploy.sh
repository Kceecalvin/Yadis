#!/bin/bash
# Quick deployment script for Vercel fixes

echo "🚀 Preparing to deploy Vercel fixes..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in ecommerce-store directory"
    echo "Please run: cd ~/ecommerce-store && bash tmp_rovodev_commit_and_deploy.sh"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Show what will be committed
echo "📝 Files to be committed:"
git status --short
echo ""

# Confirm with user
read -p "Continue with commit and push? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Add all changes
echo "➕ Adding files..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "Fix: Add database migrations to build script and switch to PostgreSQL

- Updated build script to run 'prisma migrate deploy'
- Created debug page components to prevent prerender errors
- Switched from SQLite to PostgreSQL for production compatibility
- Enhanced deployment documentation with PostgreSQL setup guide"

# Push
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Changes pushed to GitHub."
echo ""
echo "📋 Next Steps:"
echo "1. Set up PostgreSQL database (see tmp_rovodev_deploy_checklist.md)"
echo "2. Add DATABASE_URL to Vercel environment variables"
echo "3. Wait for automatic deployment to complete"
echo "4. Run seed script to add sample products"
echo ""
echo "📚 Documentation:"
echo "  - Quick checklist: tmp_rovodev_deploy_checklist.md"
echo "  - Quick setup: VERCEL_SETUP.md"
echo "  - Full guide: DEPLOYMENT.md"
echo ""
