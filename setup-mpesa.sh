#!/bin/bash

# M-Pesa Setup Script for YADDPLAST
# This script helps you configure M-Pesa credentials in .env

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║              M-PESA SETUP FOR YADDPLAST E-COMMERCE                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in current directory"
    echo "Please run this script from the ecommerce-store directory"
    exit 1
fi

echo "Your PayBill Details:"
echo "  • PayBill Number: 247247"
echo "  • Phone Number: 0702987665"
echo ""

# Prompt for credentials
echo "Enter your M-Pesa Daraja credentials:"
echo ""

read -p "🔑 Consumer Key: " CONSUMER_KEY
if [ -z "$CONSUMER_KEY" ]; then
    echo "❌ Consumer Key cannot be empty"
    exit 1
fi

read -p "🔐 Consumer Secret: " CONSUMER_SECRET
if [ -z "$CONSUMER_SECRET" ]; then
    echo "❌ Consumer Secret cannot be empty"
    exit 1
fi

read -p "🔐 Passkey: " PASSKEY
if [ -z "$PASSKEY" ]; then
    echo "❌ Passkey cannot be empty"
    exit 1
fi

read -p "📱 Phone Number (default: 0702987665): " PHONE_NUMBER
PHONE_NUMBER=${PHONE_NUMBER:-0702987665}

# Backup .env file
cp .env .env.backup
echo "✅ Backed up .env to .env.backup"

# Update .env file
# Remove old M-Pesa config if exists
sed -i '/^MPESA_/d' .env

# Add new M-Pesa config
cat >> .env << EOL

# M-Pesa Daraja Configuration
MPESA_CONSUMER_KEY=$CONSUMER_KEY
MPESA_CONSUMER_SECRET=$CONSUMER_SECRET
MPESA_SHORTCODE=247247
MPESA_PASSKEY=$PASSKEY
MPESA_CALLBACK_URL=http://localhost:3000/api/payments/mpesa/callback
EOL

echo ""
echo "✅ M-Pesa Configuration Updated!"
echo ""
echo "📋 Configuration Summary:"
echo "  ├─ Consumer Key: ${CONSUMER_KEY:0:10}...${CONSUMER_KEY: -5}"
echo "  ├─ Consumer Secret: ${CONSUMER_SECRET:0:10}...${CONSUMER_SECRET: -5}"
echo "  ├─ Shortcode: 247247"
echo "  ├─ Passkey: ${PASSKEY:0:10}...${PASSKEY: -5}"
echo "  └─ Callback URL: http://localhost:3000/api/payments/mpesa/callback"
echo ""

echo "🚀 Next Steps:"
echo "  1. Stop your current server (Ctrl+C)"
echo "  2. Run: pnpm dev"
echo "  3. Test with curl:"
echo ""
echo "     curl -X POST http://localhost:3000/api/payments/mpesa \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"orderId\":\"test-001\",\"amount\":50000,\"phoneNumber\":\"$PHONE_NUMBER\"}'"
echo ""
echo "  4. Check your phone for M-Pesa prompt"
echo ""

echo "💾 Backup saved to .env.backup (keep it safe!)"
echo ""
echo "⚠️  Important:"
echo "   • Never share your Consumer Secret or Passkey"
echo "   • Don't commit .env to git"
echo "   • These are sandbox credentials for testing"
echo ""
echo "✅ Setup Complete! Ready to test M-Pesa payments."
