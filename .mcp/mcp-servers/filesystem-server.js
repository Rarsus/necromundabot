#!/usr/bin/env node
/**
 * Filesystem MCP Server
 * Provides safe file system access for Copilot
 * - Read files
 * - List directories
 * - Find files by pattern
 * - Get project structure
 */
/* eslint-disable security/detect-non-literal-fs-filename, security/detect-non-literal-regexp, security/detect-object-injection, no-unused-vars */

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const ROOT = process.env.MCP_FILESYSTEM_ROOT || process.cwd();

class FileSystemMCPServer {
  /**
   * Safe path validation - prevent directory traversal
   */
  static validatePath(filepath) {
    const fullPath = path.resolve(path.join(ROOT, filepath));
    if (!fullPath.startsWith(path.resolve(ROOT))) {
      throw new Error(`Path traversal not allowed: ${filepath}`);
    }
    return fullPath;
  }

  /**
   * Read a file safely
   */
  static async readFile(filepath) {
    try {
      const fullPath = this.validatePath(filepath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        path: filepath,
        content,
        size: content.length,
        lines: content.split('\n').length,
      };
    } catch (error) {
      throw new Error(`Failed to read ${filepath}: ${error.message}`);
    }
  }

  /**
   * List directory contents
   */
  static async listDirectory(dirpath) {
    try {
      const fullPath = this.validatePath(dirpath);
      const files = await fs.readdir(fullPath, { withFileTypes: true });

      return files
        .map((f) => ({
          name: f.name,
          isDirectory: f.isDirectory(),
          path: path.join(dirpath, f.name),
        }))
        .sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return b.isDirectory - a.isDirectory;
          return a.name.localeCompare(b.name);
        });
    } catch (error) {
      throw new Error(`Failed to list ${dirpath}: ${error.message}`);
    }
  }

  /**
   * Get the main project structure
   */
  static async getProjectStructure() {
    const structure = {
      root: ROOT,
      directories: {},
    };

    const dirs = ['src/commands', 'src/services', 'tests/unit', 'docs', 'mcp-servers'];

    for (const dir of dirs) {
      try {
        structure.directories[dir] = await this.listDirectory(dir);
      } catch (error) {
        structure.directories[dir] = { error: error.message };
      }
    }

    return structure;
  }

  /**
   * Find files matching a pattern
   */
  static async findFiles(pattern) {
    const results = [];
    const regex = new RegExp(pattern);

    const walkDir = async (dir) => {
      try {
        const files = await fs.readdir(dir, { withFileTypes: true });

        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          const relPath = path.relative(ROOT, fullPath);

          if (file.isDirectory()) {
            if (!file.name.startsWith('.') && file.name !== 'node_modules') {
              await walkDir(fullPath);
            }
          } else if (regex.test(file.name)) {
            results.push(relPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await walkDir(ROOT);
    return results;
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(filepath) {
    try {
      const fullPath = this.validatePath(filepath);
      const stats = await fs.stat(fullPath);

      return {
        path: filepath,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isSymlink: stats.isSymbolicLink(),
      };
    } catch (error) {
      throw new Error(`Failed to get metadata for ${filepath}: ${error.message}`);
    }
  }

  /**
   * Search file contents
   */
  static async searchInFile(filepath, searchText) {
    try {
      const fileContent = await this.readFile(filepath);
      const lines = fileContent.content.split('\n');
      const results = [];

      lines.forEach((line, index) => {
        if (line.includes(searchText)) {
          results.push({
            lineNumber: index + 1,
            line: line.trim(),
            column: line.indexOf(searchText) + 1,
          });
        }
      });

      return {
        path: filepath,
        searchText,
        results,
        matchCount: results.length,
      };
    } catch (error) {
      throw new Error(`Failed to search ${filepath}: ${error.message}`);
    }
  }
}

// Export for MCP integration
module.exports = FileSystemMCPServer;

// CLI interface for testing
if (require.main === module) {
  (async () => {
    try {
      console.log('📁 Filesystem MCP Server - CLI Mode\n');

      const args = process.argv.slice(2);
      if (args[0] === 'structure') {
        const struct = await FileSystemMCPServer.getProjectStructure();
        console.log(JSON.stringify(struct, null, 2));
      } else if (args[0] === 'list') {
        const list = await FileSystemMCPServer.listDirectory(args[1] || '.');
        console.log(JSON.stringify(list, null, 2));
      } else if (args[0] === 'read') {
        const file = await FileSystemMCPServer.readFile(args[1]);
        console.log(`File: ${file.path}`);
        console.log(`Size: ${file.size} bytes, ${file.lines} lines\n`);
        console.log(file.content.split('\n').slice(0, 20).join('\n'));
        if (file.lines > 20) console.log(`\n... (${file.lines - 20} more lines)`);
      } else {
        console.log('Usage:');
        console.log('  node filesystem-server.js structure          - Show project structure');
        console.log('  node filesystem-server.js list <dir>         - List directory');
        console.log('  node filesystem-server.js read <file>        - Read file');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
