#!/bin/bash

echo "🗂️  Moving Markdown Files to Knowledge Base Structure"
echo "======================================================"

# Function to move files with confirmation
move_file() {
    local file="$1"
    local destination="$2"
    local category="$3"
    
    if [ -f "$file" ]; then
        mv "$file" "$destination"
        echo "✅ Moved $file → $destination ($category)"
    fi
}

# Setup and Configuration Files
echo "📁 Moving Setup & Configuration files..."
move_file "AUTOMATION_GUIDE.md" "docs/setup/" "Setup Guide"
move_file "DEPLOYMENT_GUIDE.md" "docs/setup/" "Setup Guide"
move_file "SECURITY-SETUP.md" "docs/setup/" "Setup Guide"
move_file "CLAUDE_DESKTOP_CONFIG.md" "docs/setup/" "Setup Guide"
move_file "QUICK_START.md" "docs/setup/" "Setup Guide"

# User Guides and How-To Documentation
echo "📁 Moving User Guides..."
move_file "HOW_TO_GET_TOP_CONTRIBUTORS.md" "docs/guides/" "User Guide"
move_file "HOW_TO_UTILIZE_MCP_SERVER.md" "docs/guides/" "User Guide"
move_file "HOW_TO_USE_MCP_SERVER.md" "docs/guides/" "User Guide"
move_file "MCP_SERVER_USAGE_GUIDE.md" "docs/guides/" "User Guide"
move_file "RELEASE_WORKFLOW_GUIDE.md" "docs/guides/" "User Guide"
move_file "PROFESSIONAL_PRESENTATION_GUIDE.md" "docs/guides/" "User Guide"
move_file "GITHUB_COPILOT_INTEGRATION.md" "docs/guides/" "User Guide"
move_file "GITHUB_COPILOT_READY.md" "docs/guides/" "User Guide"

# Templates and Reusable Content
echo "📁 Moving Templates..."
move_file "ENHANCED_TEMPLATE_SUMMARY.md" "docs/templates/" "Template"
move_file "FACTORY_PATTERN_SUMMARY.md" "docs/templates/" "Template"

# Project Summaries and Documentation
echo "📁 Moving Project Summaries..."
move_file "BUILD_SUMMARY.md" "docs/summaries/" "Project Summary"
move_file "CONSOLIDATION_SUMMARY.md" "docs/summaries/" "Project Summary"
move_file "DOCUMENTATION_SUMMARY.md" "docs/summaries/" "Project Summary"
move_file "ENHANCED_JIRA_TOOLS.md" "docs/summaries/" "Project Summary"
move_file "ENHANCED_TEAMS_LAYOUT_SUMMARY.md" "docs/summaries/" "Project Summary"
move_file "project-showcase.md" "docs/summaries/" "Project Summary"

# Sprint Reviews and Reports
echo "📁 Moving Sprint Reviews..."
move_file "SCNT-2025-19_SPRINT_REVIEW_SUMMARY.md" "docs/sprint-reviews/" "Sprint Review"
move_file "SCNT-2025-20-SPRINT-REVIEW-DELIVERED.md" "docs/sprint-reviews/" "Sprint Review"
move_file "SCNT-SPRINT-21-SUMMARY.md" "docs/sprint-reviews/" "Sprint Review"
move_file "SCNT-2025-22-COMPLETE-REPORT-SUMMARY.md" "docs/sprint-reviews/" "Sprint Review"

# Status Reports and Validation
echo "📁 Moving Status Reports..."
move_file "COMPLETE_RELEASE_WORKFLOW_RESULTS.md" "docs/reports/" "Status Report"
move_file "TEAMS_VALIDATION_REPORT.md" "docs/reports/" "Status Report"
move_file "TEAMS-LAYOUT-FIXED-SUMMARY.md" "docs/reports/" "Status Report"

# Move any remaining .md files to summaries
echo "📁 Moving remaining files..."
for file in *.md; do
    if [ -f "$file" ]; then
        move_file "$file" "docs/summaries/" "General Documentation"
    fi
done

echo ""
echo "✅ Organization Complete!"
echo "📊 Knowledge Base Structure:"
echo "  • docs/setup/ - Installation and configuration guides"
echo "  • docs/guides/ - User guides and how-to documentation"
echo "  • docs/templates/ - Reusable templates and patterns"
echo "  • docs/summaries/ - Project summaries and general documentation"
echo "  • docs/sprint-reviews/ - Sprint-specific reviews and reports"
echo "  • docs/reports/ - Status reports and validation documents"
