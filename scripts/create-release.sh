#!/bin/bash

# Create Release Script
# 
# This script creates a new release with proper versioning, tagging, and changelog.
# It analyzes changes to determine version bump and creates a release commit.
# 
# Usage: ./scripts/create-release.sh [version]
# Examples:
#   ./scripts/create-release.sh 0.3.0
#   ./scripts/create-release.sh          # Auto-detect from changes

set -e

# CRITICAL FIX: Use current working directory as PROJECT_ROOT, not script directory
# This allows the script to work from any submodule or repository location
# Example: Running from necrobot-core/ will correctly read necrobot-core/package.json, not main repo's
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPT_PARENT="$(dirname "$SCRIPT_DIR")"

# Try to determine the correct PROJECT_ROOT:
# 1. If we're in a submodule (contains package.json), use current directory
# 2. Otherwise, use script parent directory (main repo)
if [ -f "package.json" ]; then
  PROJECT_ROOT="$(pwd)"
else
  PROJECT_ROOT="$SCRIPT_PARENT"
fi

PACKAGE_JSON="$PROJECT_ROOT/package.json"
CURRENT_VERSION=$(grep '"version"' "$PACKAGE_JSON" | head -1 | sed 's/.*": "\(.*\)".*/\1/')
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                   Creating Release                         ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Current Version:${NC} $CURRENT_VERSION"
echo -e "${YELLOW}Last Tag:${NC} ${LAST_TAG:-'(none)'}"
echo ""

# If version not provided, analyze to determine it
if [ -z "$1" ]; then
  echo -e "${YELLOW}📊 Analyzing changes to determine version bump...${NC}\n"
  
  # Run analyzer to show recommendation
  node "$SCRIPT_DIR/analyze-version-impact.js" "$LAST_TAG" || {
    echo -e "${RED}❌ Could not determine version bump${NC}"
    echo -e "${YELLOW}Please specify version manually: ./scripts/create-release.sh 0.3.0${NC}"
    exit 1
  }
  
  echo -e "${YELLOW}Please provide the new version number:${NC}"
  read -p "Enter version (e.g., 0.3.0): " NEW_VERSION
else
  NEW_VERSION="$1"
fi

# Validate version format
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo -e "${RED}❌ Invalid version format. Expected: X.Y.Z (e.g., 0.3.0)${NC}"
  exit 1
fi

# Check if already released
TAG="v$NEW_VERSION"
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo -e "${RED}❌ Version $NEW_VERSION already released (tag $TAG exists)${NC}"
  exit 1
fi

echo -e "\n${GREEN}✅ Creating release for version $NEW_VERSION${NC}\n"

# Update package.json version
echo -e "${YELLOW}1. Updating package.json...${NC}"
sed -i .bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$PACKAGE_JSON"
rm -f "${PACKAGE_JSON}.bak"
echo -e "${GREEN}   ✓ Version updated to $NEW_VERSION${NC}"

# Stage the version change
git add "$PACKAGE_JSON"

# Create release commit
COMMIT_MSG="chore: release version $NEW_VERSION"
echo -e "${YELLOW}2. Creating release commit...${NC}"
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}   ℹ️  (changes already staged)${NC}"
echo -e "${GREEN}   ✓ Commit created${NC}"

# Create and push tag
echo -e "${YELLOW}3. Creating version tag...${NC}"
git tag -a "$TAG" -m "Release $NEW_VERSION"
echo -e "${GREEN}   ✓ Tag created: $TAG${NC}"

# Show summary
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                  Release Ready!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📦 Release Summary:${NC}"
echo -e "  Version:  ${GREEN}$NEW_VERSION${NC}"
echo -e "  Tag:      ${GREEN}$TAG${NC}"
echo -e "  Commit:   ${GREEN}$(git rev-parse --short HEAD)${NC}\n"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Review changes: ${BLUE}git log -1${NC}"
echo -e "  2. Push to origin: ${BLUE}git push origin main --tags${NC}"
echo -e "  3. Publish to NPM: ${BLUE}npm publish${NC}\n"

echo -e "${YELLOW}ℹ️  To undo this release:${NC}"
echo -e "  ${BLUE}git reset --soft HEAD~1${NC}"
echo -e "  ${BLUE}git tag -d $TAG${NC}"
echo -e "  ${BLUE}git checkout -- package.json${NC}\n"
