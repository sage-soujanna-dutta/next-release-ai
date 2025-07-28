# Professional Teams Template System

## Overview

The Professional Teams Template System provides a comprehensive, table-formatted template system for Microsoft Teams notifications. It integrates with the existing TeamsService and provides multiple template types for different use cases.

## Features

### 📊 Template Types
- **Sprint Report** - Comprehensive sprint analysis with tables
- **Release Notes** - Professional release documentation  
- **Status Update** - Project status and progress reports
- **Custom** - Flexible template for any content

### 🎨 Professional Formatting
- **Table-formatted data** for better readability
- **Consistent styling** across all templates
- **Proper indentation** and spacing
- **Teams-compatible markdown** rendering
- **Executive-ready presentation** quality

## Usage Examples

### 1. Sprint Report Template

```typescript
import ProfessionalTeamsTemplateService from './src/services/ProfessionalTeamsTemplateService.js';

const templateService = new ProfessionalTeamsTemplateService();

await templateService.sendSprintReport(sprintData, workBreakdown, priorityData, {
    priority: 'high',
    actionItems: [
        { role: '👔 Executives', action: 'Strategic review', timeline: 'This Week' }
    ],
    resources: [
        { type: '📊 HTML Report', description: 'Executive presentation', access: 'Available' }
    ],
    achievements: ['96.8% Completion Rate - Exceeds benchmarks']
});
```

### 2. Using with TeamsService

```typescript
import { TeamsService } from './src/services/TeamsService.js';

const teamsService = new TeamsService();

const data = {
    type: 'release-notes',
    title: 'Release v2.1.0',
    priority: 'normal',
    customContent: 'Release information...'
};

await teamsService.sendProfessionalNotification(data);
```

### 3. Custom Template

```typescript
const customData = {
    type: 'custom',
    title: 'Team Achievement Recognition',
    priority: 'high',
    customContent: `
## Achievement Details

| Metric | Result | Status |
|--------|--------|--------|
| Performance | 96.8% | ✅ Excellent |
| Quality | A+ | ✅ Outstanding |
    `
};

await templateService.sendNotification(customData);
```

## Template Structure

### Sprint Report Template Includes:
- **Executive Summary Table** - Key metrics and status
- **Work Breakdown Analysis** - Detailed work type breakdown
- **Priority Resolution Status** - Priority handling with percentages  
- **Action Items Table** - Role-based assignments
- **Resources Table** - Available documentation and reports
- **Key Achievements** - Highlighted accomplishments

### Message Card Features:
- **Professional Headers** with icons and subtitles
- **Consistent Theme Colors** based on priority level
- **Action Buttons** for quick access to resources
- **Markdown Support** for rich formatting
- **Cross-Platform Compatibility** for all Teams clients

## Integration Benefits

1. **Standardized Formatting** - All Teams messages follow the same professional format
2. **Template Reusability** - Easy to use templates for common scenarios
3. **Backwards Compatibility** - Works with existing TeamsService integration
4. **Executive Ready** - Professional presentation quality suitable for stakeholders
5. **Easy Customization** - Flexible system allows custom content and styling

## Files Created

- `ProfessionalTeamsTemplateService.ts` - Main template service
- `TeamsService.ts` - Updated with template integration
- `demo-teams-template-system.ts` - Comprehensive usage examples

## Quick Start

1. Import the template service
2. Prepare your data (sprint, work breakdown, priority data)
3. Call the appropriate template method
4. The system handles formatting and Teams delivery

The template system ensures consistent, professional Teams notifications that display properly across all platforms and are suitable for executive presentation.
