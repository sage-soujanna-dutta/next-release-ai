# Next Release AI MCP Server - System Overview

This document provides a comprehensive visual and textual overview of the Next Release AI MCP Server architecture and operational flow.

## System Purpose

The Next Release AI MCP Server is an automated release management system that:
- Integrates with JIRA for sprint and issue tracking
- Connects to GitHub for commit and contributor analysis
- Generates comprehensive release notes and reports
- Publishes content to Confluence and sends Teams notifications
- Provides multiple interfaces (MCP, HTTP API, CLI)

## Architecture Overview

The system follows a layered architecture pattern with clear separation of concerns:

### 1. Entry Points Layer
Multiple entry points support different use cases:
- **MCP Integration**: GitHub Copilot integration via Model Context Protocol
- **HTTP API**: Direct REST API access for web applications
- **CLI Interface**: Command-line tool for local development and automation

### 2. Core Framework Layer
- **Tool Factory Pattern**: Dynamic tool resolution and instantiation
- **Base Tool Interface**: Common functionality and standardized interfaces
- **Request Routing**: Intelligent routing based on request parameters

### 3. Business Logic Layer (Tools)
Specialized tools for different workflows:
- **Comprehensive Workflow**: End-to-end release process automation
- **Sprint Review**: Detailed sprint analysis and reporting
- **Story Points Analysis**: Velocity and completion tracking
- **Teams Integration**: Notification and collaboration management

### 4. Service Layer
External system integrations and core business services:
- **JIRA Service**: Issue tracking and sprint data retrieval
- **GitHub Service**: Source control and contribution analysis
- **Publishing Services**: Confluence and Teams content delivery
- **Content Services**: Release note generation and formatting

### 5. Utility Layer
Supporting utilities for data processing:
- **Formatters**: HTML and Markdown content processing
- **Analyzers**: Data analysis and metric calculation
- **Extractors**: Data transformation and normalization

## Key Features

### Automated Release Notes
- Fetches JIRA issues and GitHub commits for specified sprints
- Analyzes contributor impact and generates metrics
- Creates professionally formatted HTML and Markdown reports
- Supports customizable templates and themes

### Multi-Platform Publishing
- Saves reports to local file system
- Publishes to Confluence spaces with proper formatting
- Sends Teams notifications with adaptive cards
- Supports batch processing for multiple sprints

### Advanced Analytics
- Story point completion tracking
- Team velocity analysis and trends
- Contributor impact analysis
- Sprint-over-sprint performance metrics

### Flexible Integration
- MCP protocol for AI assistant integration
- REST API for web application integration
- CLI for automation and scripting
- Docker support for containerized deployment

## Sequence Flow

1. **Request Initiation**: Client submits request via preferred interface
2. **Tool Resolution**: Factory determines appropriate tool for the request
3. **Data Collection**: Services fetch data from JIRA, GitHub, and other sources
4. **Analysis**: Utilities process and analyze the collected data
5. **Content Generation**: Release notes and reports are generated
6. **Publishing**: Content is published to configured destinations
7. **Notification**: Stakeholders are notified via Teams or other channels
8. **Response**: Client receives confirmation and artifact locations

## Configuration and Deployment

### Environment Setup
- JIRA API credentials and server configuration
- GitHub personal access tokens
- Confluence space and authentication details
- Teams webhook URLs and channel configuration

### Deployment Options
- Local development with `npm run dev`
- Production server with `npm run server:prod`
- MCP server with `npm run mcp-server`
- Docker container with `npm run build:docker`

## Output Artifacts

The system generates multiple types of artifacts:
- **HTML Reports**: Styled, professional release notes
- **Markdown Files**: Raw content for further processing
- **Confluence Pages**: Published documentation
- **Teams Messages**: Interactive notification cards
- **Analytics Data**: JSON exports of metrics and analysis

## See Also

- [Sequence Diagram](./sequence-diagram.md) - Detailed request flow
- [Architecture Diagram](./architecture-diagram.md) - System component structure
- [Setup Guide](../setup/README.md) - Installation and configuration
- [User Guides](../guides/README.md) - Usage instructions and examples
