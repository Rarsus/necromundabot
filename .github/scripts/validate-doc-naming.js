#!/usr/bin/env node

/**
 * Document Naming Validator
 * 
 * Validates that all markdown files in the repository follow the
 * DOCUMENT-NAMING-CONVENTION.md standards.
 * 
 * Usage:
 *   node .github/scripts/validate-doc-naming.js [directory]
 *   
 * Environment Variables:
 *   STRICT: "true" to fail on warnings (default: false)
 *   VERBOSE: "true" to show all checks (default: false)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const STRICT_MODE = process.env.STRICT === 'true';
const VERBOSE = process.env.VERBOSE === 'true';
const MAX_FILENAME_LENGTH = 80;
const IGNORED_DIRS = ['.git', 'node_modules', '.github', 'repos'];

// Naming patterns by document type and location
const NAMING_PATTERNS = {
  root: {
    pattern: /^[A-Z][A-Z0-9_-]*\.md$/,
    description: 'Root documents must use UPPER_SNAKE_CASE (e.g., README.md, DOCUMENTATION-INDEX.md)',
    examples: ['README.md', 'CHANGELOG.md', 'DOCUMENTATION-INDEX.md'],
  },
  docsGeneral: {
    pattern: /^[a-z][a-z0-9-]*\.md$/,
    description: 'Directory documents must use lowercase-kebab-case (e.g., setup-guide.md)',
    examples: ['setup-guide.md', 'quick-reference.md', 'api-documentation.md'],
  },
  docsTyped: {
    pattern: /^(TEST|CONFIG|TASK|DB|PERM|ARCH|REQ|PLANNING)-[A-Z0-9_-]+\.md$/,
    description: 'Typed documents use PREFIX-DESCRIPTOR format (e.g., TEST-NAMING-GUIDE.md)',
    examples: ['TEST-NAMING-CONVENTION.md', 'CONFIG-ESLINT-SETUP.md'],
  },
  docsQRC: {
    pattern: /^[A-Z][A-Z0-9_-]*(-QUICK)?\.md$|^[a-z][a-z0-9-]*(-quick)?\.md$/,
    description: 'Quick reference documents in docs/QRC/ use descriptive names or *-QUICK suffix (e.g., COMMAND-REFERENCE-QUICK.md)',
    examples: ['COMMAND-REFERENCE-QUICK.md', 'DOCUMENT-NAMING-QUICK-REFERENCE.md', 'quick-reference.md'],
  },
  phase: {
    pattern: /^PHASE-\d+\.\d+[a-z]?(-[A-Z][A-Z0-9_-]+)?\.md$/,
    description: 'Phase documents in project-docs/PHASE-#.#/ use PHASE-#.# or PHASE-#.#a-DESCRIPTOR format',
    examples: ['PHASE-23.1-COMPLETION-REPORT.md', 'PHASE-23.1a-SETUP.md', 'PHASE-23.1-INDEX.md'],
  },
  projectDocsPlanning: {
    pattern: /^(PLANNING|ANALYSIS|INDEX)-[A-Z0-9_-]*\.md$|^(planning|analysis)-[a-z0-9-]*\.md$/,
    description: 'Project docs planning/analysis documents use PLANNING-* or planning-* format',
    examples: ['PLANNING-ROADMAP.md', 'ANALYSIS-SUMMARY.md', 'planning-sprint-001.md'],
  },
  submoduleRoot: {
    pattern: /^(README|CHANGELOG)\.md$/,
    description: 'Submodule root documents must be README.md or CHANGELOG.md',
    examples: ['README.md', 'CHANGELOG.md'],
  },
};

// Track results
let totalFiles = 0;
let validFiles = 0;
let errors = [];
let warnings = [];

/**
 * Get the expected naming pattern for a file based on its directory
 */
function getPatternForFile(filePath) {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const dirParts = dirName.split(path.sep);
  
  // Root level documents
  if (dirName === '.' || dirName === '') {
    return NAMING_PATTERNS.root;
  }
  
  // Submodule root documents
  if (dirName.startsWith('repos/') && dirParts.length === 2) {
    if (fileName === 'README.md' || fileName === 'CHANGELOG.md') {
      return NAMING_PATTERNS.submoduleRoot;
    }
  }
  
  // Quick Reference Collection documents (docs/QRC/)
  if (dirName.includes('docs/QRC') || dirName.includes('docs' + path.sep + 'QRC')) {
    return NAMING_PATTERNS.docsQRC;
  }
  
  // Phase documents in project-docs/PHASE-*/ folders
  if (dirName.includes('project-docs/PHASE') || dirName.includes('project-docs' + path.sep + 'PHASE')) {
    return NAMING_PATTERNS.phase;
  }
  
  // Planning/Analysis documents in project-docs/ folders
  if (dirName.startsWith('project-docs/') || dirName.startsWith('project-docs' + path.sep)) {
    return NAMING_PATTERNS.projectDocsPlanning;
  }
  
  // Documents with type prefixes (TEST-, CONFIG-, TASK-, etc.)
  if (NAMING_PATTERNS.docsTyped.pattern.test(fileName)) {
    return NAMING_PATTERNS.docsTyped;
  }
  
  // General directory documents (lowercase-kebab-case)
  return NAMING_PATTERNS.docsGeneral;
}

/**
 * Validate a single file
 */
function validateFile(filePath) {
  totalFiles++;
  
  const fileName = path.basename(filePath);
  const pattern = getPatternForFile(filePath);
  
  // Check filename length
  if (fileName.length > MAX_FILENAME_LENGTH) {
    errors.push({
      file: filePath,
      issue: `Filename too long (${fileName.length} > ${MAX_FILENAME_LENGTH} chars): "${fileName}"`,
      severity: 'error',
    });
    return;
  }
  
  // Check filename format
  if (!pattern.pattern.test(fileName)) {
    errors.push({
      file: filePath,
      issue: `Invalid naming format: "${fileName}"`,
      expected: pattern.description,
      examples: pattern.examples,
      severity: 'error',
    });
    return;
  }
  
  // Check for invalid characters (allowed: a-z, A-Z, 0-9, -, _, .)
  if (!/^[a-zA-Z0-9._-]+\.md$/.test(fileName)) {
    errors.push({
      file: filePath,
      issue: `Invalid characters in filename: "${fileName}"`,
      allowed: 'a-z, A-Z, 0-9, hyphen (-), underscore (_), period (.)',
      severity: 'error',
    });
    return;
  }
  
  // Check for spaces (common mistake)
  if (fileName.includes(' ')) {
    errors.push({
      file: filePath,
      issue: `Spaces not allowed in filename: "${fileName}"`,
      suggestion: fileName.replace(/ /g, '-'),
      severity: 'error',
    });
    return;
  }
  
  validFiles++;
  if (VERBOSE) {
    console.log(`✅ ${filePath}`);
  }
}

/**
 * Scan directory recursively
 */
function scanDirectory(dir, parentDir = '') {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      // Skip ignored directories
      if (IGNORED_DIRS.includes(file) || file.startsWith('.')) {
        return;
      }
      
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const relPath = path.relative('.', filePath);
        scanDirectory(filePath, relPath);
      } else if (file.endsWith('.md')) {
        const relPath = path.relative('.', filePath);
        validateFile(relPath);
      }
    });
  } catch (err) {
    warnings.push({
      directory: dir,
      issue: `Could not scan directory: ${err.message}`,
      severity: 'warning',
    });
  }
}

/**
 * Format and output results
 */
function printResults() {
  console.log('\n' + '='.repeat(70));
  console.log('📚 Document Naming Convention Validation');
  console.log('='.repeat(70) + '\n');
  
  console.log(`📊 Summary`);
  console.log(`  Total files scanned: ${totalFiles}`);
  console.log(`  Valid files: ${validFiles}`);
  console.log(`  Invalid files: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}\n`);
  
  if (errors.length > 0) {
    console.log('❌ ERRORS (Must Fix):');
    console.log('-'.repeat(70));
    errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.file}`);
      console.log(`   Issue: ${error.issue}`);
      if (error.expected) {
        console.log(`   Expected: ${error.expected}`);
      }
      if (error.examples) {
        console.log(`   Examples: ${error.examples.join(', ')}`);
      }
      if (error.suggestion) {
        console.log(`   Suggestion: ${error.suggestion}`);
      }
      if (error.allowed) {
        console.log(`   Allowed: ${error.allowed}`);
      }
    });
    console.log('\n' + '-'.repeat(70));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    console.log('-'.repeat(70));
    warnings.forEach((warning, index) => {
      console.log(`\n${index + 1}. ${warning.directory || 'General'}`);
      console.log(`   ${warning.issue}`);
    });
    console.log('\n' + '-'.repeat(70));
  }
  
  // Final status
  console.log('\n📋 Status:');
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All documents follow naming conventions!\n');
    return 0;
  } else if (errors.length === 0) {
    console.log('⚠️  Warnings found but no errors\n');
    return STRICT_MODE ? 1 : 0;
  } else {
    console.log('❌ Naming convention violations found\n');
    console.log('💡 How to fix:');
    console.log('  1. Review the errors above');
    console.log('  2. Rename files to match the expected pattern');
    console.log('  3. Update all cross-references in other documents');
    console.log('  4. Run: npm run validate:docs');
    console.log('\n📖 For details, see: DOCUMENT-NAMING-CONVENTION.md\n');
    return 1;
  }
}

/**
 * Main execution
 */
function main() {
  const targetDir = process.argv[2] || '.';
  
  console.log(`🔍 Scanning documentation in: ${targetDir}\n`);
  
  scanDirectory(targetDir);
  const exitCode = printResults();
  
  process.exit(exitCode);
}

// Run validation
main();
