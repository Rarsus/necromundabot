#!/usr/bin/env node
/**
 * Shell MCP Server
 * Provides safe command execution for Copilot
 * - Run npm scripts (test, lint, build)
 * - Execute Discord commands
 * - Get project information
 * - Limited to safe operations
 */
/* eslint-disable security/detect-non-literal-fs-filename */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CWD = process.env.MCP_SHELL_CWD || process.cwd();

// Whitelist of allowed commands
const ALLOWED_COMMANDS = {
  'npm test': 'Run full test suite',
  'npm run test:all': 'Run all tests',
  'npm run test:quotes': 'Run quote tests',
  'npm run test:quotes-advanced': 'Run advanced quote tests',
  'npm run test:utils:base': 'Run command base tests',
  'npm run test:utils:options': 'Run options builder tests',
  'npm run test:utils:helpers': 'Run response helpers tests',
  'npm run test:integration:refactor': 'Run integration tests',
  'npm run lint': 'Check code style',
  'npm run lint:fix': 'Fix code style issues',
  'npm run lint:check': 'Check lint errors',
  'npm run register-commands': 'Register Discord commands',
  'npm install': 'Install dependencies',
  'npm audit': 'Security audit',
  'node --version': 'Check Node.js version',
  'npm --version': 'Check npm version',
};

class ShellMCPServer {
  /**
   * Validate if a command is allowed
   */
  static isCommandAllowed(command) {
    return Object.keys(ALLOWED_COMMANDS).some((allowed) => command.startsWith(allowed) || allowed.startsWith(command));
  }

  /**
   * Execute a command safely
   */
  static exec(command, options = {}) {
    if (!this.isCommandAllowed(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }

    try {
      const result = execSync(command, {
        cwd: CWD,
        encoding: 'utf-8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        ...options,
      });

      return {
        command,
        success: true,
        output: result,
        exitCode: 0,
      };
    } catch (error) {
      return {
        command,
        success: false,
        output: error.stdout ? error.stdout.toString() : '',
        error: error.message,
        exitCode: error.status || 1,
      };
    }
  }

  /**
   * Run tests
   */
  static runTests() {
    return this.exec('npm test');
  }

  /**
   * Run all tests
   */
  static runTestAll() {
    return this.exec('npm run test:all');
  }

  /**
   * Run quote-specific tests
   */
  static runTestQuotes() {
    return this.exec('npm run test:quotes');
  }

  /**
   * Run linting
   */
  static runLint() {
    return this.exec('npm run lint');
  }

  /**
   * Run linting and fix issues
   */
  static runLintFix() {
    return this.exec('npm run lint:fix');
  }

  /**
   * Register Discord commands
   */
  static registerCommands() {
    return this.exec('npm run register-commands');
  }

  /**
   * Install dependencies
   */
  static installDependencies() {
    return this.exec('npm install');
  }

  /**
   * Get project information
   */
  static getProjectInfo() {
    try {
      const packagePath = path.join(CWD, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

      const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
      const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();

      return {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        nodeVersion,
        npmVersion,
        cwd: CWD,
        hasEnv: fs.existsSync(path.join(CWD, '.env')),
        hasGit: fs.existsSync(path.join(CWD, '.git')),
      };
    } catch (error) {
      throw new Error(`Failed to get project info: ${error.message}`);
    }
  }

  /**
   * Get available npm scripts
   */
  static getAvailableScripts() {
    try {
      const packagePath = path.join(CWD, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

      return {
        scripts: packageJson.scripts || {},
        allowedCommands: ALLOWED_COMMANDS,
      };
    } catch (error) {
      throw new Error(`Failed to get scripts: ${error.message}`);
    }
  }

  /**
   * Get test scripts specifically
   */
  static getTestScripts() {
    const scripts = this.getAvailableScripts();
    const testScripts = {};

    Object.entries(scripts.scripts).forEach(([name, cmd]) => {
      if (name.includes('test')) {
        // eslint-disable-next-line security/detect-object-injection
        testScripts[name] = cmd;
      }
    });

    return testScripts;
  }

  /**
   * Check if dependencies are installed
   */
  static checkDependencies() {
    try {
      const nodeModules = path.join(CWD, 'node_modules');
      const exists = fs.existsSync(nodeModules);

      if (exists) {
        const sqlite3 = fs.existsSync(path.join(nodeModules, 'sqlite3'));
        const discordJs = fs.existsSync(path.join(nodeModules, 'discord.js'));
        const dotenv = fs.existsSync(path.join(nodeModules, 'dotenv'));

        return {
          nodeModulesInstalled: true,
          dependencies: {
            sqlite3,
            'discord.js': discordJs,
            dotenv,
          },
        };
      }

      return {
        nodeModulesInstalled: false,
        dependencies: {},
      };
    } catch (error) {
      throw new Error(`Failed to check dependencies: ${error.message}`);
    }
  }

  /**
   * Get security audit
   */
  static getSecurityAudit() {
    return this.exec('npm audit');
  }
}

// Export for MCP integration
module.exports = ShellMCPServer;

// CLI interface for testing
if (require.main === module) {
  (async () => {
    try {
      console.log('💻 Shell MCP Server - CLI Mode\n');

      const args = process.argv.slice(2);
      const command = args[0];

      if (command === 'info') {
        console.log(JSON.stringify(ShellMCPServer.getProjectInfo(), null, 2));
      } else if (command === 'scripts') {
        console.log(JSON.stringify(ShellMCPServer.getAvailableScripts(), null, 2));
      } else if (command === 'test-scripts') {
        console.log(JSON.stringify(ShellMCPServer.getTestScripts(), null, 2));
      } else if (command === 'check-deps') {
        console.log(JSON.stringify(ShellMCPServer.checkDependencies(), null, 2));
      } else if (command === 'run') {
        const script = args[1];
        if (!script) {
          console.error('Usage: node shell-server.js run <script>');
          process.exit(1);
        }
        const result = ShellMCPServer.exec(script);
        console.log(`Command: ${result.command}`);
        console.log(`Success: ${result.success}`);
        console.log(`Exit Code: ${result.exitCode}\n`);
        console.log(result.output || result.error);
      } else {
        console.log('Usage:');
        console.log('  node shell-server.js info          - Show project info');
        console.log('  node shell-server.js scripts       - List all scripts');
        console.log('  node shell-server.js test-scripts  - List test scripts');
        console.log('  node shell-server.js check-deps    - Check dependencies');
        console.log('  node shell-server.js run <script>  - Run an allowed script');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
