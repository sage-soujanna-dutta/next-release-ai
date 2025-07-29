#!/bin/bash

# Next Release AI MCP Server - Quick Deploy Script

set -e

echo "🚀 Starting deployment of Next Release AI MCP Server..."

# Check if Docker is available
if command -v docker >/dev/null 2>&1; then
    echo "✅ Docker found - Building Docker image..."
    
    # Build Docker image
    docker build -t next-release-ai-mcp .
    
    echo "🔧 Stopping existing container (if any)..."
    docker stop mcp-server 2>/dev/null || true
    docker rm mcp-server 2>/dev/null || true
    
    echo "🌐 Starting MCP server container..."
    docker run -d \
        --name mcp-server \
        -p 3000:3000 \
        --env-file .env \
        --restart unless-stopped \
        next-release-ai-mcp
    
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    echo "🔍 Testing server health..."
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Server is healthy and running!"
        echo "🌐 Server URL: http://localhost:3000"
        echo "📋 Available endpoints:"
        echo "   • Health: http://localhost:3000/health"
        echo "   • Tools: http://localhost:3000/tools"
        echo "   • API Docs: http://localhost:3000/"
    else
        echo "❌ Server health check failed"
        echo "📝 Container logs:"
        docker logs mcp-server
        exit 1
    fi
    
else
    echo "🔧 Docker not found - Using Node.js direct deployment..."
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Build the application
    echo "🏗️ Building application..."
    npm run build
    
    # Start the server
    echo "🌐 Starting server..."
    npm run server:prod &
    
    # Get process ID
    SERVER_PID=$!
    echo "📝 Server PID: $SERVER_PID"
    
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    echo "🔍 Testing server health..."
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Server is healthy and running!"
        echo "🌐 Server URL: http://localhost:3000"
        echo "📋 Process ID: $SERVER_PID"
        echo "💡 To stop the server: kill $SERVER_PID"
    else
        echo "❌ Server health check failed"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "📚 See DEPLOYMENT_GUIDE.md for more information"
