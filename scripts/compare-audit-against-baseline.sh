#!/bin/bash
# Script: compare-audit-against-baseline.sh
# Purpose: Compare current npm audit against baseline and provide status
# Usage: ./scripts/compare-audit-against-baseline.sh [--fail-on-new] [--json]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Options
FAIL_ON_NEW=false
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --fail-on-new)
      FAIL_ON_NEW=true
      shift
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

BASELINE_FILE=".github/audit-baseline.json"
CURRENT_AUDIT="/tmp/current-audit-$$.json"

# Check baseline exists
if [ ! -f "$BASELINE_FILE" ]; then
  echo -e "${RED}❌ Error: Baseline file not found at $BASELINE_FILE${NC}"
  exit 1
fi

# Get current audit
echo "🔍 Running npm audit..." >&2
npm audit --json > "$CURRENT_AUDIT" 2>/dev/null || true

# Extract vulnerability counts
BASELINE_TOTAL=$(jq '.totalVulnerabilities' "$BASELINE_FILE" 2>/dev/null || echo "0")
CURRENT_TOTAL=$(jq '.metadata.vulnerabilities.total' "$CURRENT_AUDIT" 2>/dev/null || echo "0")

BASELINE_HIGH=$(jq '.vulnerabilities | map(select(.severity == "HIGH")) | length' "$BASELINE_FILE" 2>/dev/null || echo "0")
CURRENT_HIGH=$(jq '.metadata.vulnerabilities.high' "$CURRENT_AUDIT" 2>/dev/null || echo "0")

BASELINE_MODERATE=$(jq '.vulnerabilities | map(select(.severity == "MODERATE")) | length' "$BASELINE_FILE" 2>/dev/null || echo "0")
CURRENT_MODERATE=$(jq '.metadata.vulnerabilities.moderate' "$CURRENT_AUDIT" 2>/dev/null || echo "0")

# Check for NEW vulnerabilities (not in baseline)
BASELINE_PACKAGES=$(jq -r '.vulnerabilities[].package' "$BASELINE_FILE" 2>/dev/null | sort)
CURRENT_PACKAGES=$(jq -r '.vulnerabilities[].package' "$CURRENT_AUDIT" 2>/dev/null | sort)

NEW_PACKAGES=$(comm -13 <(echo "$BASELINE_PACKAGES") <(echo "$CURRENT_PACKAGES") 2>/dev/null || echo "")

# Determine status
STATUS="✅ PASS"
EXIT_CODE=0

if [ "$CURRENT_TOTAL" -gt "$BASELINE_TOTAL" ]; then
  STATUS="${RED}❌ FAIL${NC} - Vulnerabilities increased"
  EXIT_CODE=1
elif [ ! -z "$NEW_PACKAGES" ]; then
  STATUS="${RED}❌ FAIL${NC} - New vulnerabilities detected"
  EXIT_CODE=1
fi

# JSON output
if [ "$JSON_OUTPUT" = true ]; then
  cat <<EOF
{
  "status": "$STATUS",
  "baseline": {
    "total": $BASELINE_TOTAL,
    "high": $BASELINE_HIGH,
    "moderate": $BASELINE_MODERATE
  },
  "current": {
    "total": $CURRENT_TOTAL,
    "high": $CURRENT_HIGH,
    "moderate": $CURRENT_MODERATE
  },
  "newPackages": $(echo "$NEW_PACKAGES" | jq -R -s -c 'split("\n") | map(select(length > 0))'),
  "acceptable": $([ "$EXIT_CODE" -eq 0 ] && echo "true" || echo "false")
}
EOF
else
  # Human-readable output
  echo -e "\n${BLUE}📊 Vulnerability Audit Comparison${NC}"
  echo "=================================="
  echo -e "Baseline File: $BASELINE_FILE"
  echo -e "Baseline Total: $BASELINE_TOTAL (HIGH: $BASELINE_HIGH, MODERATE: $BASELINE_MODERATE)"
  echo -e "Current Total: $CURRENT_TOTAL (HIGH: $CURRENT_HIGH, MODERATE: $CURRENT_MODERATE)"
  echo ""

  if [ ! -z "$NEW_PACKAGES" ]; then
    echo -e "${RED}New Vulnerabilities Detected:${NC}"
    echo "$NEW_PACKAGES" | grep -v '^$' | sed 's/^/  - /'
    echo ""
  fi

  echo -e "Status: $STATUS"

  if [ "$FAIL_ON_NEW" = true ] && [ "$EXIT_CODE" -ne 0 ]; then
    echo -e "${RED}Failing CI due to --fail-on-new flag${NC}"
  fi
fi

# Cleanup
rm -f "$CURRENT_AUDIT"

exit $EXIT_CODE
