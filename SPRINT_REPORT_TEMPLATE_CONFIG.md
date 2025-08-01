# Sprint Report Template Configuration

## Default Template Source
**Primary Template**: `/output/SCNT-2025-21-sprint-report.md`

This file serves as the master template for all sprint report generation across the MCP server tools.

## Template Implementation

The professional template is implemented in:
- **Markdown Generation**: `/src/utils/MarkdownFormatter.ts`
- **HTML Generation**: `/src/generators/HTMLReportGenerator.ts`
- **Service Integration**: `/src/services/ReleaseNotesService.ts`

## Template Structure

The SCNT-2025-21-sprint-report.md template includes these sections:

### 1. Header & Metadata
- Sprint name with emoji
- Date range and completion status
- Completion percentage

### 2. Executive Summary
- Completion Rate with status indicators
- Story Points delivered
- Team Size and activity metrics
- Sprint Duration and Velocity

### 3. Sprint Comparison
- Current vs Previous Sprint metrics
- Trend indicators (increasing/decreasing)
- Change calculations

### 4. Work Breakdown Analysis
- Issue type distribution (Stories, Bugs, Tasks, Epics, Improvements)
- Percentage breakdown
- Focus area mapping

### 5. Priority Resolution Status
- Priority level tracking (Critical, Major, Minor, Low, Blockers)
- Success rates
- Status indicators

### 6. Top Contributors
- Individual performance metrics
- Commit counts and story points
- Issues resolved
- Impact level assessment

### 7. Key Achievements
- Sprint accomplishments
- Impact level categorization
- Metrics summary

### 8. Key Insights & Performance Analysis
- Team Strengths
- Areas for Improvement
- Performance Trends

### 9. Risk Assessment
- Risk level categorization
- Identified risk factors
- Mitigation strategies

### 10. Action Items
- Role-based assignments
- Timeline specifications
- Priority levels

### 11. Strategic Recommendations
- Category-based recommendations (Process, Team, Technical, Performance)
- Rationale explanations
- Priority color coding

## MCP Tools Using This Template

All MCP server tools that generate sprint reports will use this template by default:

- `generate_release_notes` (when format=markdown)
- `generate_comprehensive_sprint_report`
- `create_release_workflow`
- `enhanced_jira_fetch` (when generating reports)
- `comprehensive_release_workflow`

## Usage Guidelines

1. **Consistent Formatting**: All tools must generate reports that match the structure in SCNT-2025-21-sprint-report.md
2. **Status Indicators**: Use the same emoji and status patterns
3. **Table Formatting**: Maintain consistent table structures and column headers
4. **Metrics Calculation**: Follow the same calculation methods for completion rates, velocity, etc.
5. **Professional Tone**: Maintain executive-ready language and presentation

## Updating the Template

To update the default template:
1. Modify `/output/SCNT-2025-21-sprint-report.md` as the reference
2. Update `/src/utils/MarkdownFormatter.ts` implementation
3. Test with actual sprint data
4. Verify all MCP tools generate consistent output

## Quality Assurance

The template ensures:
- Executive-ready professional presentation
- Consistent metrics across all reports
- Comprehensive performance analysis
- Actionable insights and recommendations
- Risk-aware project management
- Team performance transparency
