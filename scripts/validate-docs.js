#!/usr/bin/env node

/**
 * Validate Docs Script
 * Checks documentation file naming conventions against DOCUMENT-NAMING-CONVENTION.md rules
 * Used by GitHub Actions workflows for documentation validation
 *
 * Enforces:
 * - Root-level: UPPERCASE_SNAKE_CASE.md
 * - Root deliverables: DESCRIPTOR-REPORT.md, PHASE-#.#X-TYPE.md
 * - Subdirectories: lowercase-kebab-case.md
 * - Type prefixes: TEST-*, CONFIG-*, etc.
 */

const fs = require('fs');
const path = require('path');

const STRICT_MODE = process.argv.includes('--strict');

// Validation rules
const RULES = {
  root: {
    allowed: [
      /^[A-Z][A-Z0-9_-]*\.md$/, // UPPERCASE.md or UPPERCASE_CASE.md
      /^[A-Z][A-Z0-9_-]*-[A-Z][A-Z0-9_-]*\.md$/, // DESCRIPTOR-DESCRIPTOR.md
      /^README\.md$/,
      /^LICENSE$/,
      /^LICENCE$/,
    ],
    ignored: [
      '.git',
      '.github',
      'node_modules',
      'repos',
      'src',
      'tests',
      'scripts',
      'docs',
      'project-docs',
      'dist',
      '.env',
      '.env.local',
      'package-lock.json',
      /^\..*$/, // Hidden files
      /^package\.json$/,
      /^tsconfig.*\.json$/,
      /^jest\.config\.js$/,
      /^eslint\.config\.js$/,
    ],
  },
  subdirs: {
    allowed: /^[a-z0-9][a-z0-9\-]*\.md$/,
    typePrefix: /^[A-Z][A-Z0-9_-]*-[a-z]/, // TEST-*, CONFIG-*, etc.
  },
};

let violations = [];

/**
 * Check if name should be ignored
 */
function shouldIgnore(name, rules = RULES.root) {
  return rules.ignored.some((pattern) => {
    if (typeof pattern === 'string') {
      return name === pattern;
    }
    return pattern.test(name);
  });
}

/**
 * Check if name matches allowed patterns
 */
function isValidName(name, rules = RULES.root) {
  // If rules is just a regex pattern, test directly
  if (rules instanceof RegExp) {
    return rules.test(name);
  }
  // If rules has allowed property (is an object), check against allowed patterns
  if (rules.allowed && Array.isArray(rules.allowed)) {
    return rules.allowed.some((pattern) => pattern.test(name));
  }
  return false;
}

/**
 * Validate root-level markdown files
 */
function validateRootDocs() {
  const rootDir = '/home/olav/repo/necromundabot';
  const files = fs.readdirSync(rootDir);

  files.forEach((file) => {
    if (file.endsWith('.md') && !shouldIgnore(file)) {
      if (!isValidName(file)) {
        violations.push({
          severity: 'error',
          file: file,
          location: 'root',
          message: `Invalid naming convention for root-level document: "${file}"`,
          expected: 'UPPERCASE.md, UPPERCASE_CASE.md, PHASE-#.#-DESCRIPTOR.md, or similar',
        });
      }
    }
  });
}

/**
 * Validate docs/ subdirectory files
 */
function validateDocsDirs() {
  const docsRoot = '/home/olav/repo/necromundabot/docs';

  function checkDir(dirPath, relPath = '') {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      const currentRelPath = relPath ? `${relPath}/${file}` : file;

      if (stat.isDirectory()) {
        // Recurse into subdirectories
        checkDir(fullPath, currentRelPath);
      } else if (file.endsWith('.md')) {
        // In strict mode, enforce rules
        if (STRICT_MODE && !isValidName(file, RULES.subdirs)) {
          violations.push({
            severity: 'error',
            file: currentRelPath,
            location: 'docs/',
            message: `Invalid naming convention in docs/: "${file}"`,
            expected: 'lowercase-kebab-case.md or TYPE-lowercase-descriptor.md',
          });
        }
      }
    });
  }

  checkDir(docsRoot);
}

/**
 * Validate project-docs/ subdirectory files
 */
function validateProjectDocsDirs() {
  const projectDocsRoot = '/home/olav/repo/necromundabot/project-docs';

  function checkDir(dirPath, relPath = '') {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      const currentRelPath = relPath ? `${relPath}/${file}` : file;

      if (stat.isDirectory()) {
        // Recurse into subdirectories
        checkDir(fullPath, currentRelPath);
      } else if (file.endsWith('.md')) {
        // Root files in project-docs/ can be PHASE-*.md or ROOT_CASE.md
        if (!relPath) {
          // Root level files in project-docs/ - in strict mode only
          if (STRICT_MODE && !/^(PHASE-|[A-Z][A-Z0-9_-]*\.md)/.test(file)) {
            violations.push({
              severity: 'warning',
              file: currentRelPath,
              location: 'project-docs/',
              message: `Unusual naming in project-docs/: "${file}"`,
              expected: 'PHASE-#.#X-DESCRIPTOR.md or UPPERCASE.md pattern',
            });
          }
        } else {
          // Files in subdirectories - in strict mode only
          if (STRICT_MODE && !isValidName(file, RULES.subdirs)) {
            violations.push({
              severity: 'error',
              file: currentRelPath,
              location: 'project-docs/',
              message: `Invalid naming convention in project-docs/: "${file}"`,
              expected: 'lowercase-kebab-case.md or TYPE-descriptor.md',
            });
          }
        }
      }
    });
  }

  checkDir(projectDocsRoot);
}

/**
 * Print violations
 */
function printViolations() {
  if (violations.length === 0) {
    console.log('✅ All documentation files follow naming conventions!');
    return 0;
  }

  const errors = violations.filter((v) => v.severity === 'error');
  const warnings = violations.filter((v) => v.severity === 'warning');

  if (errors.length > 0) {
    console.log('\n❌ ERRORS (naming convention violations):');
    errors.forEach((v) => {
      console.log(`  📄 ${v.file}`);
      console.log(`     └─ ${v.message}`);
      console.log(`     └─ Expected: ${v.expected}\n`);
    });
  }

  if (warnings.length > 0 && STRICT_MODE) {
    console.log('\n⚠️  WARNINGS (strict mode):');
    warnings.forEach((v) => {
      console.log(`  📄 ${v.file}`);
      console.log(`     └─ ${v.message}`);
      console.log(`     └─ Suggested: ${v.expected}\n`);
    });
  }

  console.log(`\n📊 Summary: ${errors.length} error(s), ${warnings.length} warning(s)`);

  // In strict mode, warnings count as failures
  if (STRICT_MODE && (errors.length > 0 || warnings.length > 0)) {
    return 1;
  }

  // In normal mode, only errors cause failure
  return errors.length > 0 ? 1 : 0;
}

/**
 * Main execution
 */
function main() {
  try {
    validateRootDocs();
    validateDocsDirs();
    validateProjectDocsDirs();

    const exitCode = printViolations();
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Error validating documentation:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run validation
main();
