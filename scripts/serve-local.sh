#!/bin/bash

echo "🌐 Serving static build locally..."
echo ""
echo "📁 Serving files from: $(pwd)/out/"
echo "🔗 Access your site at: http://localhost:3000"
echo "   (NOT at /dashboard/ - that's only for GitHub Pages)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if serve is installed, if not install it
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

# Serve the out directory
npx serve out/ -p 3000 