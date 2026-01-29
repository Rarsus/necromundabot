#!/usr/bin/env node

/**
 * Analyze Version Impact
 * 
 * This script analyzes git commits since the last release tag and determines
 * the appropriate SemVer version bump based on conventional commits and code changes.
 * 
 * Usage: node scripts/analyze-version-impact.js [lastTag]
 * Example: node scripts/analyze-version-impact.js v0.2.1
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class VersionImpactAnalyzer {
  constructor(lastTag) {
    this.lastTag = lastTag;
    this.commits = [];
    this.changes = {
      feat: [],
      fix: [],
      breaking: [],
      docs: [],
      refactor: [],
      chore: [],
      test: [],
      other: [],
    };
    this.fileStats = {
      src: { added: 0, deleted: 0, modified: 0 },
      tests: { added: 0, deleted: 0, modified: 0 },
      docs: { added: 0, deleted: 0, modified: 0 },
      other: { added: 0, deleted: 0, modified: 0 },
    };
  }

  /**
   * Run git command and return output
   */
  execGit(cmd) {
    try {
      return execSync(cmd, { encoding: 'utf-8' }).trim();
    } catch (error) {
      console.error(`Git command failed: ${cmd}`);
      return '';
    }
  }

  /**
   * Get all commits since last tag
   */
  getCommits() {
    const range = this.lastTag ? `${this.lastTag}..HEAD` : 'HEAD';
    const output = this.execGit(`git log ${range} --pretty=format:"%H|%s|%b"`);
    
    if (!output) return [];

    return output.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split('|');
        const hash = (parts[0] || '').trim();
        const subject = (parts[1] || '').trim();
        const body = (parts[2] || '').trim();
        return { hash, subject, body };
      });
  }

  /**
   * Parse conventional commit format
   */
  parseCommit(commit) {
    const match = commit.subject.match(/^(\w+)(\(.+\))?!?:\s(.+)/);
    
    if (!match) {
      return { type: 'other', scope: null, breaking: false, description: commit.subject };
    }

    const [, type, scope, description] = match;
    const breaking = commit.subject.includes('!:') || commit.body.includes('BREAKING CHANGE:');

    return {
      type: type.toLowerCase(),
      scope: scope ? scope.slice(1, -1) : null,
      breaking,
      description,
    };
  }

  /**
   * Categorize commits
   */
  categorizeCommits() {
    this.commits = this.getCommits();

    this.commits.forEach(commit => {
      const parsed = this.parseCommit(commit);

      if (parsed.breaking) {
        this.changes.breaking.push(parsed);
      } else if (this.changes[parsed.type]) {
        this.changes[parsed.type].push(parsed);
      } else {
        this.changes.other.push(parsed);
      }
    });
  }

  /**
   * Analyze file changes to determine impact
   */
  analyzeFileChanges() {
    const range = this.lastTag ? `${this.lastTag}..HEAD` : 'HEAD';
    
    // Get status of files (Added, Modified, Deleted)
    const statusOutput = this.execGit(`git diff ${range} --name-status`);
    const newFiles = statusOutput.split('\n').filter(line => line.startsWith('A\t'));
    
    newFiles.forEach(line => {
      const filepath = line.replace('A\t', '');
      const category = this.categorizeFile(filepath);
      this.fileStats[category].added++;
    });

    // Also get stat for line changes
    const diffStat = this.execGit(`git diff ${range} --stat=200`);
    if (!diffStat) return;

    const lines = diffStat.split('\n');
    
    lines.forEach(line => {
      // Skip header line
      if (line.includes('changed')) return;
      if (!line.trim()) return;

      const match = line.match(/^(.+?)\s+\|\s+(\d+)\s+([+\-]+)/);
      if (!match) return;

      const [, filepath, insertions, markers] = match;
      const additions = (insertions.match(/\+/g) || []).length;
      const deletions = (markers.match(/-/g) || []).length;

      const category = this.categorizeFile(filepath);
      const stat = this.fileStats[category];

      // Only count modifications if file already existed (not in our added list)
      if (!markers.match(/^\++$/) && !markers.match(/^-+$/)) {
        stat.modified++;
      } else if (markers.match(/^-+$/)) {
        stat.deleted++;
      }
    });
  }

  /**
   * Categorize file by path
   */
  categorizeFile(filepath) {
    if (filepath.includes('/src/') || filepath.includes('src/')) return 'src';
    if (filepath.includes('/tests/') || filepath.includes('test')) return 'tests';
    if (filepath.includes('/docs/') || filepath.includes('.md')) return 'docs';
    return 'other';
  }

  /**
   * Determine version bump based on analysis
   */
  determineVersionBump(currentVersion) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    // Breaking changes → major version bump
    if (this.changes.breaking.length > 0) {
      return `${major + 1}.0.0`;
    }

    // New features (feat commits) or new source files → minor version bump
    if (this.changes.feat.length > 0 || this.fileStats.src.added > 0) {
      return `${major}.${minor + 1}.0`;
    }

    // Bug fixes, refactors, or test additions → patch version bump
    if (this.changes.fix.length > 0 || 
        this.changes.refactor.length > 0 ||
        this.fileStats.tests.added > 0) {
      return `${major}.${minor}.${patch + 1}`;
    }

    // Only docs/chore changes → no version bump needed
    return null;
  }

  /**
   * Generate analysis report
   */
  generateReport(currentVersion) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           Version Impact Analysis Report                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Current Version: ${currentVersion}`);
    console.log(`📍 Analyzing from: ${this.lastTag || 'initial commit'}\n`);

    // Commit breakdown
    console.log('📝 Commit Breakdown:');
    console.log(`  ⭐ Features (feat):     ${this.changes.feat.length}`);
    console.log(`  🔧 Fixes (fix):        ${this.changes.fix.length}`);
    console.log(`  🚨 Breaking Changes:   ${this.changes.breaking.length}`);
    console.log(`  ♻️  Refactors:         ${this.changes.refactor.length}`);
    console.log(`  📚 Docs:               ${this.changes.docs.length}`);
    console.log(`  🧹 Chores:             ${this.changes.chore.length}`);
    console.log(`  ✅ Tests:              ${this.changes.test.length}`);
    console.log(`  ❓ Other:              ${this.changes.other.length}\n`);

    // File changes
    console.log('📂 File Changes:');
    console.log(`  src/       → Added: ${this.fileStats.src.added}, Deleted: ${this.fileStats.src.deleted}, Modified: ${this.fileStats.src.modified}`);
    console.log(`  tests/     → Added: ${this.fileStats.tests.added}, Deleted: ${this.fileStats.tests.deleted}, Modified: ${this.fileStats.tests.modified}`);
    console.log(`  docs/      → Added: ${this.fileStats.docs.added}, Deleted: ${this.fileStats.docs.deleted}, Modified: ${this.fileStats.docs.modified}`);
    console.log(`  other/     → Added: ${this.fileStats.other.added}, Deleted: ${this.fileStats.other.deleted}, Modified: ${this.fileStats.other.modified}\n`);

    const newVersion = this.determineVersionBump(currentVersion);
    
    if (newVersion) {
      console.log(`✅ Recommended Version Bump: ${currentVersion} → ${newVersion}`);
      
      if (currentVersion.split('.')[0] !== newVersion.split('.')[0]) {
        console.log('   (Major version bump - Breaking changes detected)\n');
      } else if (currentVersion.split('.')[1] !== newVersion.split('.')[1]) {
        console.log('   (Minor version bump - New features added)\n');
      } else {
        console.log('   (Patch version bump - Bug fixes or code additions)\n');
      }
    } else {
      console.log('⏭️  No version bump needed (only docs/chore/test changes)\n');
    }

    // Detailed commit list
    if (this.commits.length > 0) {
      console.log('📋 Commit Details:');
      this.commits.forEach((commit, idx) => {
        const parsed = this.parseCommit(commit);
        const icon = 
          parsed.breaking ? '🚨' :
          parsed.type === 'feat' ? '⭐' :
          parsed.type === 'fix' ? '🔧' :
          parsed.type === 'refactor' ? '♻️' :
          parsed.type === 'docs' ? '📚' :
          '❓';
        
        console.log(`  ${idx + 1}. ${icon} ${commit.subject.substring(0, 70)}`);
      });
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    End of Report                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    return newVersion;
  }

  /**
   * Run full analysis
   */
  analyze(currentVersion) {
    this.categorizeCommits();
    this.analyzeFileChanges();
    return this.generateReport(currentVersion);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const lastTag = args[0] || null;

  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    const currentVersion = packageJson.version;

    const analyzer = new VersionImpactAnalyzer(lastTag);
    const recommendation = analyzer.analyze(currentVersion);

    if (recommendation) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(2);
  }
}

module.exports = VersionImpactAnalyzer;
