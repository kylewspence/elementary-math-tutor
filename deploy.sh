#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process for Long Division Tutor"

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Run linting
echo "🔍 Running linter..."
npx eslint src --ext .ts,.tsx

# Step 3: Build the application
echo "🏗️ Building the application..."
npm run build

# Step 4: Prepare for deployment
echo "🔧 Preparing for deployment..."
# Add any pre-deployment tasks here, such as:
# - Copying additional files to the dist directory
# - Setting up environment variables

echo "✅ Build completed successfully!"
echo "The application is ready for deployment in the 'dist' directory."
echo ""
echo "To deploy to your hosting provider, follow these steps:"
echo "1. Upload the contents of the 'dist' directory to your web server"
echo "2. Ensure your server is configured to serve a single-page application"
echo "3. Set up any required environment variables on your server"
echo ""
echo "For more detailed deployment instructions, refer to DEPLOYMENT.md" 