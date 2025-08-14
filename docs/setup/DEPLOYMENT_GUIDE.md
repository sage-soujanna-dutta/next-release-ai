# Next Release AI MCP Server - Deployment Guide

## Overview
This guide explains how to build, deploy, and host your MCP server for production use.

## Build and Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker installed on your system
- Environment variables configured

#### Steps

1. **Build the Docker image:**
   ```bash
   docker build -t next-release-ai-mcp .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name mcp-server \
     -p 3000:3000 \
     --env-file .env \
     next-release-ai-mcp
   ```

3. **Verify deployment:**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Node.js Direct Deployment

#### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

#### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm run server
   ```

### Option 3: Cloud Platform Deployment

#### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

#### AWS/Google Cloud/Azure
1. Use the Dockerfile to build container image
2. Push to container registry
3. Deploy using your preferred container service

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 3000)
- `JIRA_BASE_URL` - Your JIRA instance URL
- `JIRA_EMAIL` - JIRA account email
- `JIRA_API_TOKEN` - JIRA API token
- `GITHUB_TOKEN` - GitHub personal access token

## API Endpoints

Once deployed, your MCP server will expose:

- `GET /` - API documentation and server info
- `GET /health` - Health check endpoint
- `GET /tools` - List all available tools
- `POST /tools/:toolName/execute` - Execute a specific tool
- `POST /mcp` - Raw MCP protocol communication

## Usage Examples

### Health Check
```bash
curl http://your-server:3000/health
```

### List Tools
```bash
curl http://your-server:3000/tools
```

### Execute Tool
```bash
curl -X POST http://your-server:3000/tools/generate-release-notes/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sprintName": "SCNT-2025-22",
    "projectKey": "SCNT"
  }'
```

### MCP Protocol Communication
```bash
curl -X POST http://your-server:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/list"
  }'
```

## Security Considerations

1. **Environment Variables:** Never commit sensitive data to version control
2. **HTTPS:** Use HTTPS in production
3. **Authentication:** Consider adding API key authentication for production use
4. **Rate Limiting:** Implement rate limiting for public endpoints
5. **CORS:** Configure CORS appropriately for your use case

## Monitoring and Logging

- Health endpoint: `/health` returns server status
- Logs are written to stdout/stderr
- Consider using structured logging in production

## Scaling

For high-load scenarios:
- Use a load balancer
- Deploy multiple instances
- Consider using a reverse proxy (nginx)
- Implement proper caching strategies

## Troubleshooting

1. **Server won't start:**
   - Check environment variables
   - Verify port availability
   - Check logs for errors

2. **Tools not working:**
   - Verify JIRA/GitHub credentials
   - Check network connectivity
   - Review tool-specific configuration

3. **Performance issues:**
   - Monitor resource usage
   - Check for memory leaks
   - Optimize database queries if applicable

## Support

For issues and questions:
1. Check the logs first
2. Verify configuration
3. Test individual tool endpoints
4. Review this documentation
