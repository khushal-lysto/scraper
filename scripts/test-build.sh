#!/bin/bash

echo "🧪 Testing build for GitHub Pages deployment..."

# Clean previous build
echo "📦 Cleaning previous build..."
rm -rf out/

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ -d "out" ]; then
    echo "✅ Build successful! Static files generated in 'out/' directory"
    echo "📁 Build contents:"
    ls -la out/
    
    echo ""
    echo "🌐 To test locally, you can serve the out/ directory with:"
    echo "   npx serve out/"
    echo "   or"
    echo "   python3 -m http.server --directory out/"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi 