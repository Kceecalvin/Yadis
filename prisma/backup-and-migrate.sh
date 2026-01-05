#!/bin/bash
echo "🔄 Multi-Vendor Migration Script"
echo "================================"
echo ""

# Backup products first
echo "📦 Step 1: Backing up existing products..."
PGPASSWORD=npg_5bBZoCVOYK9M psql -h ep-falling-union-a40tlb7v-pooler.us-east-1.aws.neon.tech -U neondb_owner -d neondb -c "
COPY (SELECT * FROM \"Product\") TO STDOUT WITH CSV HEADER
" > /tmp/products_backup.csv
echo "✅ Backup saved to /tmp/products_backup.csv"
echo ""

# Reset database with new schema
echo "🗄️  Step 2: Applying new schema (this will reset data)..."
pnpm exec prisma db push --force-reset --accept-data-loss
echo ""

# Run migration script
echo "🏪 Step 3: Creating your vendor account..."
pnpm exec tsx prisma/migrate-to-multivendor.ts
echo ""

echo "✨ Migration complete!"
echo ""
echo "📝 Manual steps needed:"
echo "1. Update ownerPhone and ownerEmail in the Vendor table"
echo "2. Re-add your 15 products with the vendor ID"
echo "3. Test the new multi-vendor system"
