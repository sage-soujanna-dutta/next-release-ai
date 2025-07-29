#!/bin/bash

echo "🗂️  Organizing Markdown Files into Knowledge Base Structure"
echo "======================================================"

# Create the knowledge base directory structure
mkdir -p docs/{guides,summaries,reports,templates,setup,sprint-reviews}

echo "📁 Created knowledge base folder structure:"
echo "  • docs/guides/ - User guides and how-to documentation"
echo "  • docs/summaries/ - Project and feature summaries"  
echo "  • docs/reports/ - Sprint and status reports"
echo "  • docs/templates/ - Reusable templates"
echo "  • docs/setup/ - Installation and configuration guides"
echo "  • docs/sprint-reviews/ - Sprint-specific documentation"
echo ""

# List all .md files
echo "📋 Found markdown files:"
find . -maxdepth 1 -name "*.md" -type f | sort

echo ""
echo "🚀 Ready to organize files!"
