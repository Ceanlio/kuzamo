#!/bin/bash

echo "🚀 Deploying Kuzamo to Cloudflare Pages..."

# Deploy to main branch (production)
echo "📦 Deploying to main branch..."
wrangler pages deploy . --project-name kuzamo-pages --branch main

# Deploy to production branch (preview)
echo "📦 Deploying to production branch..."
wrangler pages deploy . --project-name kuzamo-pages --branch production

echo "✅ Deployment complete!"
echo ""
echo "🌐 Main branch: https://kuzamo.com"
echo "🔍 Preview: https://production.kuzamo-pages.pages.dev"
echo ""
echo "📊 Check deployment status:"
echo "   wrangler pages deployment list --project-name kuzamo-pages"
