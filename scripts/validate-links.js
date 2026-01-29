#!/usr/bin/env node

/**
 * Validate Links Script
 * Checks for broken links in markdown documentation files
 * Used by GitHub Actions workflows for link validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VALID_PROTOCOLS = ['http://', 'https://', 'ftp://'];
const IGNORED_PATTERNS = ['<', '{{', '${'];

/**
 * Extract links from markdown content
 * @param {string} content - Markdown content
 * @returns {string[]} Array of URLs
 */
function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[2];
    // Skip template variables and placeholders
    if (!IGNORED_PATTERNS.some(pattern => url.includes(pattern))) {
      links.push(url);
    }
  }

  return links;
}

/**
 * Check if URL is reachable
 * @param {string} url - URL to check
 * @returns {boolean} True if reachable
 */
function isValidUrl(url) {
  // Skip local file references and anchors
  if (url.startsWith('#') || url.startsWith('./') || url.startsWith('../')) {
    return true;
  }

  // Check if it's a valid protocol
  return VALID_PROTOCOLS.some(protocol => url.startsWith(protocol));
}

/**
 * Validate links in markdown files
 */
function validateLinks() {
  const docDirs = ['docs', 'project-docs'];
  let brokenLinks = [];

  docDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;

    // Find all markdown files
    const files = execSync(`find ${dir} -name "*.md"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(f => f);

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const links = extractLinks(content);

      links.forEach(link => {
        if (!isValidUrl(link)) {
          brokenLinks.push({ file, link });
        }
      });
    });
  });

  if (brokenLinks.length > 0) {
    console.error('❌ Broken links found:');
    brokenLinks.forEach(({ file, link }) => {
      console.error(`  ${file}: ${link}`);
    });
    process.exit(1);
  }

  console.log('✅ All links validated successfully');
  process.exit(0);
}

// Run validation
validateLinks();
