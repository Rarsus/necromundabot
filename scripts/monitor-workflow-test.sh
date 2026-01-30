#!/bin/bash

# Workflow Consolidation Test - Monitoring Script
# This script monitors the test PR and subsequent release workflow

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Workflow Consolidation Test - Monitoring Dashboard        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Test PR Status"
echo "─────────────────────────────────────────────────────────────"
echo "PR #25: test/workflow-consolidation refactoring validation"
echo "URL: https://github.com/Rarsus/necromundabot/pull/25"
echo ""

# Function to check PR status
check_pr_status() {
    echo "⏱️  Checking PR workflows... ($(date '+%H:%M:%S'))"
    gh pr view 25 --json title,state,statusCheckRollup,author --template '
PR Title: {{.title}}
State: {{.state}}
Author: {{.author.login}}
Status Checks:
{{- range .statusCheckRollup}}
  - {{.name}}: {{.status}} {{if eq .status "COMPLETED"}}({{.conclusion}}){{end}}
{{- else}}
  (Workflows queued, starting soon...)
{{- end}}'
}

# Function to check release workflow
check_release_status() {
    echo ""
    echo "🚀 Release Workflow Status"
    echo "─────────────────────────────────────────────────────────────"
    
    # Get latest workflow runs on main
    RELEASE_RUNS=$(gh run list --branch main --workflow release.yml --limit 3 --json status,conclusion,createdAt --template '{{range .}}
Run: {{.createdAt}} | Status: {{.status}} | Conclusion: {{.conclusion}}
{{end}}' 2>/dev/null || echo "No release workflow runs yet")
    
    echo "$RELEASE_RUNS"
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo "📋 Next Steps"
    echo "─────────────────────────────────────────────────────────────"
    echo "1. Monitor PR workflows at:"
    echo "   https://github.com/Rarsus/necromundabot/pull/25/checks"
    echo ""
    echo "2. Once PR checks pass, merge with:"
    echo "   gh pr merge 25 --merge --admin"
    echo ""
    echo "3. Monitor release workflow at:"
    echo "   https://github.com/Rarsus/necromundabot/actions/workflows/release.yml"
    echo ""
    echo "4. Verify version sync and package publishing:"
    echo "   - Check package.json versions are synced"
    echo "   - Verify git tag is created"
    echo "   - Confirm packages published to GitHub Packages"
}

# Main monitoring loop
check_pr_status
check_release_status
show_next_steps

echo ""
echo "✅ Monitoring script ready. Check PR and release workflows."
echo ""
