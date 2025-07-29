#!/bin/bash

echo "📊 Knowledge Base Organization Verification"
echo "=========================================="
echo ""

# Check root directory for .md files
echo "🔍 Root Directory Status:"
root_md_count=$(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ')
echo "  Remaining .md files: $root_md_count"

if [ "$root_md_count" -eq 1 ]; then
    echo "  ✅ SUCCESS: Only README.md remains in root"
    echo "  📄 File: $(ls -1 *.md 2>/dev/null)"
else
    echo "  📋 Files still in root:"
    ls -1 *.md 2>/dev/null | head -10 | while read file; do
        echo "    - $file"
    done
    if [ "$root_md_count" -gt 10 ]; then
        echo "    ... and $((root_md_count - 10)) more files"
    fi
fi

echo ""
echo "📁 Knowledge Base Directory Status:"

# Check each knowledge base directory
for dir in "docs/setup" "docs/guides" "docs/templates" "docs/summaries" "docs/sprint-reviews" "docs/reports"; do
    if [ -d "$dir" ]; then
        file_count=$(find "$dir" -name "*.md" -type f | wc -l | tr -d ' ')
        echo "  📂 $dir: $file_count files"
    else
        echo "  ❌ $dir: Directory not found"
    fi
done

echo ""
echo "📊 Total Files Summary:"
total_docs=$(find docs -name "*.md" -type f | wc -l | tr -d ' ')
echo "  Knowledge base files: $total_docs"
echo "  Root directory files: $root_md_count"
echo "  Total documentation: $((total_docs + root_md_count))"

echo ""
if [ "$root_md_count" -eq 1 ]; then
    echo "✅ SUCCESS: Documentation successfully organized!"
    echo "🎯 Root directory cleaned - only README.md remains"
    echo "📚 Knowledge base structure is complete and ready for use"
else
    echo "⚠️  PARTIAL: Some .md files still remain in root directory"
    echo "🔧 Manual cleanup may be needed for remaining files"
fi

echo ""
echo "🚀 Knowledge Base Access:"
echo "  👉 Start here: docs/README.md"
echo "  📖 Main project: README.md"
