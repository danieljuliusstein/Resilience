#!/bin/bash

echo "🚀 Cloudflare Pages Setup Script"
echo "================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
else
    echo "✅ Wrangler CLI is installed"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🔐 Login to Cloudflare:"
echo "   wrangler login"
echo ""
echo "2. 🏗️  Build the project:"
echo "   npm run build:cloudflare"
echo ""
echo "3. 📦 Create a Pages project:"
echo "   wrangler pages project create rest-express-app"
echo ""
echo "4. 🚀 Deploy your project:"
echo "   wrangler pages deploy dist/public --project-name=rest-express-app"
echo ""
echo "5. 🔧 Set up environment variables:"
echo "   wrangler secret put DATABASE_URL --env production"
echo "   wrangler secret put SENDGRID_API_KEY --env production"
echo "   wrangler secret put OPENAI_API_KEY --env production"
echo ""
echo "6. 🌐 Optional - Set up custom domain:"
echo "   Go to Cloudflare Pages > Your Project > Custom domains"
echo ""
echo "📖 For detailed instructions, see CLOUDFLARE_DEPLOYMENT.md"
echo ""
echo "🎉 Your project is ready for Cloudflare Pages!"
echo ""

# Make the script executable
chmod +x "$0"