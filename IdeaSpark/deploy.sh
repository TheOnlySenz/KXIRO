#!/bin/bash

# IdeaSpark Deployment Script
# This script builds and deploys the web version of IdeaSpark

echo "🚀 Starting IdeaSpark deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your Supabase credentials."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build web version
echo "🌐 Building web version..."
npm run build:web

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Web build successful!"
    echo "📁 Build files are in the 'web-build' directory"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Upload the contents of 'web-build' to your web hosting service"
    echo "2. Configure your domain to point to the hosting service"
    echo "3. Set up environment variables on your hosting platform"
    echo ""
    echo "🌍 Your IdeaSpark app is ready for deployment!"
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi