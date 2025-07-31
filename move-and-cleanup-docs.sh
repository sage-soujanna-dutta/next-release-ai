#!/bin/bash

echo "🗂️  Moving Documentation Files and Cleaning Root Directory"
echo "======================================================"

# Function to move files safely
move_file() {
    local file="$1"
    local destination="$2"
    local category="$3"
    
    if [ -f "$file" ]; then
        mv "$file" "$destination"
        echo "✅ Moved: $file → $destination ($category)"
        return 0
    else
        echo "⚠️  Not found: $file"
        return 1
    fi
}

moved_count=0

echo ""
echo "📁 Moving Setup & Configuration files..."
move_file "AUTOMATION_GUIDE.md" "docs/setup/" "Setup" && ((moved_count++))
move_file "DEPLOYMENT_GUIDE.md" "docs/setup/" "Setup" && ((moved_count++))
move_file "SECURITY-SETUP.md" "docs/setup/" "Setup" && ((moved_count++))
move_file "CLAUDE_DESKTOP_CONFIG.md" "docs/setup/" "Setup" && ((moved_count++))
move_file "QUICK_START.md" "docs/setup/" "Setup" && ((moved_count++))
move_file "README_SETUP.md" "docs/setup/" "Setup" && ((moved_count++))

echo ""
echo "📁 Moving User Guides..."
move_file "HOW_TO_GET_TOP_CONTRIBUTORS.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "HOW_TO_UTILIZE_MCP_SERVER.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "HOW_TO_USE_MCP_SERVER.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "MCP_SERVER_USAGE_GUIDE.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "MCP_COMMANDS.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "MCP_SPRINT_REPORTS_GUIDE.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "RELEASE_WORKFLOW_GUIDE.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "PROFESSIONAL_PRESENTATION_GUIDE.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "GITHUB_COPILOT_INTEGRATION.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "GITHUB_COPILOT_READY.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "TEAMS_TEMPLATE_SYSTEM_GUIDE.md" "docs/guides/" "Guide" && ((moved_count++))
move_file "SPRINT_REPORT_QUICK_REFERENCE.md" "docs/guides/" "Guide" && ((moved_count++))

echo ""
echo "📁 Moving Templates..."
move_file "ENHANCED_TEMPLATE_SUMMARY.md" "docs/templates/" "Template" && ((moved_count++))
move_file "FACTORY_PATTERN_SUMMARY.md" "docs/templates/" "Template" && ((moved_count++))
move_file "STANDARD_SPRINT_REPORT_TEMPLATE.md" "docs/templates/" "Template" && ((moved_count++))
move_file "TEMPLATE_VS_SERVICE_COMPARISON.md" "docs/templates/" "Template" && ((moved_count++))

echo ""
echo "📁 Moving Sprint Reviews..."
move_file "SCNT-2025-19_SPRINT_REVIEW_SUMMARY.md" "docs/sprint-reviews/" "Sprint Review" && ((moved_count++))
move_file "SCNT-2025-20-SPRINT-REVIEW-DELIVERED.md" "docs/sprint-reviews/" "Sprint Review" && ((moved_count++))
move_file "SCNT-SPRINT-21-SUMMARY.md" "docs/sprint-reviews/" "Sprint Review" && ((moved_count++))
move_file "SCNT-2025-22-COMPLETE-REPORT-SUMMARY.md" "docs/sprint-reviews/" "Sprint Review" && ((moved_count++))
move_file "SPRINT_REVIEW_SUMMARY.md" "docs/sprint-reviews/" "Sprint Review" && ((moved_count++))

echo ""
echo "📁 Moving Status Reports..."
move_file "COMPLETE_RELEASE_WORKFLOW_RESULTS.md" "docs/reports/" "Report" && ((moved_count++))
move_file "TEAMS_VALIDATION_REPORT.md" "docs/reports/" "Report" && ((moved_count++))
move_file "TEAMS-LAYOUT-FIXED-SUMMARY.md" "docs/reports/" "Report" && ((moved_count++))
move_file "TEAMS_BULLETS_NUMBERING_FIX.md" "docs/reports/" "Report" && ((moved_count++))
move_file "TEAMS_CONTENT_ORDER_COMPLETE.md" "docs/reports/" "Report" && ((moved_count++))
move_file "TEAMS_INDENTATION_FIX_SUMMARY.md" "docs/reports/" "Report" && ((moved_count++))
move_file "TEAMS_MESSAGE_ORDER_FIX.md" "docs/reports/" "Report" && ((moved_count++))
move_file "TEAMS_NOTIFICATION_DISPLAY_FIX.md" "docs/reports/" "Report" && ((moved_count++))

echo ""
echo "📁 Moving Project Summaries..."
move_file "BUILD_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "CONSOLIDATION_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "DOCUMENTATION_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "ENHANCED_JIRA_TOOLS.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "ENHANCED_TEAMS_LAYOUT_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "project-showcase.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "MCP_SERVER_UTILIZATION_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "MCP_TOOLS_INTEGRATION.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "PROFESSIONAL_SPRINT_REPORTS_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "TEAMS_NOTIFICATIONS_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "TEAMS_SERVICE_PROFESSIONAL_DEFAULT.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "STAKEHOLDER_RELEASE_NOTES_DOCUMENTATION.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "PDF_REPORT_GENERATOR_CODE_REVIEW.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "HTML_ATTACHMENT_SOLUTION_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "HTML_REPORT_TEAMS_SUMMARY.md" "docs/summaries/" "Summary" && ((moved_count++))
move_file "MOST_ACCURATE_CONTRIBUTOR_ANALYSIS_COMPLETE.md" "docs/summaries/" "Summary" && ((moved_count++))

echo ""
echo "📁 Moving remaining .md files to summaries (except README.md)..."
for file in *.md; do
    if [ -f "$file" ] && [ "$file" != "README.md" ]; then
        move_file "$file" "docs/summaries/" "General Documentation" && ((moved_count++))
    fi
done

echo ""
echo "✅ Documentation Organization and Cleanup Complete!"
echo "📊 Summary:"
echo "  • Files moved to knowledge base: $moved_count"
echo "  • Files kept in root: README.md"
echo ""
echo "🧹 Root directory cleanup verification:"
remaining_md=$(ls -1 *.md 2>/dev/null | wc -l)
echo "  • Remaining .md files in root: $remaining_md"

if [ $remaining_md -eq 1 ]; then
    echo "  ✅ Root directory successfully cleaned! Only README.md remains."
else
    echo "  📋 Remaining files:"
    ls -1 *.md 2>/dev/null | while read file; do
        echo "    - $file"
    done
fi

echo ""
echo "📚 Knowledge Base Structure Complete:"
echo "  • docs/setup/ - Installation and configuration"
echo "  • docs/guides/ - User guides and how-to docs"
echo "  • docs/templates/ - Reusable templates"
echo "  • docs/summaries/ - Project summaries"
echo "  • docs/sprint-reviews/ - Sprint documentation"
echo "  • docs/reports/ - Status reports"
echo ""
echo "🎉 Knowledge base is ready and root directory is clean!"
