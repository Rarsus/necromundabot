#!/usr/bin/env node
/**
 * Git MCP Server
 * Provides git repository access for Copilot
 * - Status and diff info
 * - Commit history
 * - Branch management
 * - File changes tracking
 */
/* eslint-disable security/detect-object-injection */

const { execSync } = require('child_process');

const REPO = process.env.MCP_GIT_REPO || process.cwd();

class GitMCPServer {
  /**
   * Execute a git command safely
   */
  static exec(command, options = {}) {
    try {
      const result = execSync(`cd "${REPO}" && ${command}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options,
      });
      return result.trim();
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  /**
   * Get current repository status
   */
  static getStatus() {
    try {
      const porcelain = this.exec('git status --porcelain');
      const branch = this.exec('git rev-parse --abbrev-ref HEAD');
      const commit = this.exec('git rev-parse HEAD').slice(0, 7);
      const remote = this.exec('git remote get-url origin');

      const modified = porcelain.split('\n').filter((l) => l.startsWith(' M')).length;
      const added = porcelain.split('\n').filter((l) => l.startsWith('A')).length;
      const deleted = porcelain.split('\n').filter((l) => l.startsWith(' D')).length;
      const untracked = porcelain.split('\n').filter((l) => l.startsWith('??')).length;

      return {
        branch,
        commit,
        remote,
        changes: {
          modified,
          added,
          deleted,
          untracked,
          total: modified + added + deleted + untracked,
        },
        hasChanges: modified + added + deleted + untracked > 0,
        porcelain,
      };
    } catch (error) {
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }

  /**
   * Get commit history
   */
  static getLog(count = 10, format = 'oneline') {
    try {
      const output = this.exec(`git log --${format} -${count}`);
      return output.split('\n').filter((line) => line.trim());
    } catch (error) {
      throw new Error(`Failed to get git log: ${error.message}`);
    }
  }

  /**
   * Get detailed commit info
   */
  static getCommitDetails(ref = 'HEAD') {
    try {
      const commit = this.exec(`git show --pretty=format:"%H|%an|%ae|%ad|%s" --no-patch ${ref}`);
      const [hash, author, email, date, subject] = commit.split('|');

      return {
        hash: hash.slice(0, 7),
        fullHash: hash,
        author,
        email,
        date,
        subject,
        url: `${this.exec('git remote get-url origin')}/commit/${hash}`,
      };
    } catch (error) {
      throw new Error(`Failed to get commit details: ${error.message}`);
    }
  }

  /**
   * Get list of branches
   */
  static getBranches() {
    try {
      const local = this.exec('git branch --list')
        .split('\n')
        .filter((l) => l.trim());
      const current = this.exec('git rev-parse --abbrev-ref HEAD');

      return {
        current,
        local,
        count: local.length,
      };
    } catch (error) {
      throw new Error(`Failed to get branches: ${error.message}`);
    }
  }

  /**
   * Get diff for a file or all changed files
   */
  static getDiff(filepath = null) {
    try {
      const cmd = filepath ? `git diff ${filepath}` : 'git diff';
      const output = this.exec(cmd);

      return {
        filepath: filepath || 'all',
        diff: output,
        hasChanges: output.length > 0,
      };
    } catch (error) {
      throw new Error(`Failed to get diff: ${error.message}`);
    }
  }

  /**
   * Get staged changes
   */
  static getStagedChanges() {
    try {
      const diff = this.exec('git diff --cached');
      const files = this.exec('git diff --cached --name-only')
        .split('\n')
        .filter((l) => l.trim());

      return {
        files,
        fileCount: files.length,
        diff,
        hasStagedChanges: files.length > 0,
      };
    } catch (error) {
      throw new Error(`Failed to get staged changes: ${error.message}`);
    }
  }

  /**
   * Get list of changed files (unstaged)
   */
  static getChangedFiles() {
    try {
      const output = this.exec('git diff --name-only');
      const files = output.split('\n').filter((l) => l.trim());

      return {
        files,
        count: files.length,
      };
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error.message}`);
    }
  }

  /**
   * Get all modified files (staged and unstaged)
   */
  static getAllModifiedFiles() {
    try {
      const output = this.exec('git status --porcelain');
      const files = {};

      output.split('\n').forEach((line) => {
        if (!line.trim()) return;
        const status = line.slice(0, 2);
        const filepath = line.slice(3);

        files[filepath] = {
          status,
          isModified: status === ' M' || status === 'M',
          isAdded: status === 'A ',
          isDeleted: status === ' D' || status === 'D',
          isUntracked: status === '??',
          isRenamed: status === 'R',
        };
      });

      return files;
    } catch (error) {
      throw new Error(`Failed to get modified files: ${error.message}`);
    }
  }

  /**
   * Get tags
   */
  static getTags() {
    try {
      const tags = this.exec('git tag -l --sort=-version:refname')
        .split('\n')
        .filter((l) => l.trim());
      const latest = tags[0] || null;

      return {
        tags,
        count: tags.length,
        latest,
      };
    } catch (error) {
      throw new Error(`Failed to get tags: ${error.message}`);
    }
  }

  /**
   * Get remote URL
   */
  static getRemoteUrl(remote = 'origin') {
    try {
      return this.exec(`git remote get-url ${remote}`);
    } catch (error) {
      throw new Error(`Failed to get remote URL: ${error.message}`);
    }
  }
}

// Export for MCP integration
module.exports = GitMCPServer;

// CLI interface for testing
if (require.main === module) {
  (async () => {
    try {
      console.log('🔗 Git MCP Server - CLI Mode\n');

      const args = process.argv.slice(2);
      const command = args[0];

      if (command === 'status') {
        console.log(JSON.stringify(GitMCPServer.getStatus(), null, 2));
      } else if (command === 'log') {
        const count = parseInt(args[1]) || 10;
        console.log(GitMCPServer.getLog(count).join('\n'));
      } else if (command === 'branches') {
        console.log(JSON.stringify(GitMCPServer.getBranches(), null, 2));
      } else if (command === 'modified') {
        console.log(JSON.stringify(GitMCPServer.getAllModifiedFiles(), null, 2));
      } else if (command === 'diff') {
        const file = args[1] || null;
        const result = GitMCPServer.getDiff(file);
        console.log(`File: ${result.filepath}`);
        console.log(`Has Changes: ${result.hasChanges}\n`);
        console.log(result.diff.split('\n').slice(0, 30).join('\n'));
        if (result.diff.split('\n').length > 30) console.log('\n... (more diff)');
      } else if (command === 'tags') {
        console.log(JSON.stringify(GitMCPServer.getTags(), null, 2));
      } else {
        console.log('Usage:');
        console.log('  node git-server.js status          - Show git status');
        console.log('  node git-server.js log [count]     - Show commit log');
        console.log('  node git-server.js branches        - List branches');
        console.log('  node git-server.js modified        - List modified files');
        console.log('  node git-server.js diff [file]     - Show diff');
        console.log('  node git-server.js tags            - List tags');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
