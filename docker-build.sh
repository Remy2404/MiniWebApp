#!/bin/bash

# Docker build script for MiniWebApp
# Usage: ./docker-build.sh [backend_url]

set -e

# Get backend URL from argument or environment variable
BACKEND_URL=${1:-$VITE_BACKEND_URL}

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Error: Backend URL not provided"
    echo "Usage: ./docker-build.sh https://your-backend-url.com"
    echo "Or set VITE_BACKEND_URL environment variable"
    exit 1
fi

echo "🚀 Building MiniWebApp Docker image..."
echo "📡 Backend URL: $BACKEND_URL"

# Build the Docker image with the backend URL
docker build \
    --build-arg VITE_BACKEND_URL="$BACKEND_URL" \
    -t miniwebapp:latest \
    .

echo "✅ Docker build completed successfully!"
echo "🐳 Image: miniwebapp:latest"
echo ""
echo "To run the container:"
echo "docker run -p 10000:10000 miniwebapp:latest"
