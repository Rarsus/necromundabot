#!/usr/bin/env node
/**
 * NPM MCP Server
 * Provides access to package.json metadata and npm scripts
 * - List npm scripts
 * - Filter test/dev scripts
 * - Get version info
 * - List dependencies
 */
/* eslint-disable security/detect-object-injection */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, 'package.json');

class NPMMCPServer {
  constructor() {
    this.packageData = null;
  }

  /**
   * Load package.json
   */
  loadPackage() {
    if (!this.packageData) {
      if (!fs.existsSync(PACKAGE_JSON_PATH)) {
        throw new Error('package.json not found');
      }
      this.packageData = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    }
    return this.packageData;
  }

  /**
   * Get all npm scripts
   */
  getScripts() {
    const pkg = this.loadPackage();
    return {
      scripts: pkg.scripts || {},
      count: Object.keys(pkg.scripts || {}).length,
    };
  }

  /**
   * Get test scripts only
   */
  getTestScripts() {
    const pkg = this.loadPackage();
    const scripts = pkg.scripts || {};
    const testScripts = {};

    for (const [name, cmd] of Object.entries(scripts)) {
      if (name.includes('test') || cmd.includes('test') || cmd.includes('mocha') || cmd.includes('jest')) {
        testScripts[name] = cmd;
      }
    }

    return testScripts;
  }

  /**
   * Get dev/build scripts
   */
  getDevScripts() {
    const pkg = this.loadPackage();
    const scripts = pkg.scripts || {};
    const devScripts = {};

    const devKeywords = ['dev', 'build', 'start', 'watch', 'lint', 'format'];
    for (const [name, cmd] of Object.entries(scripts)) {
      if (devKeywords.some((kw) => name.includes(kw))) {
        devScripts[name] = cmd;
      }
    }

    return devScripts;
  }

  /**
   * Get version information
   */
  getVersion() {
    const pkg = this.loadPackage();
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      main: pkg.main,
      keywords: pkg.keywords || [],
      author: pkg.author,
      license: pkg.license,
    };
  }

  /**
   * Get all dependencies
   */
  getDependencies() {
    const pkg = this.loadPackage();
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
      optionalDependencies: pkg.optionalDependencies || {},
      peerDependencies: pkg.peerDependencies || {},
    };
  }

  /**
   * Get specific dependency version
   */
  getDependencyVersion(depName) {
    const pkg = this.loadPackage();
    const version =
      pkg.dependencies?.[depName] ||
      pkg.devDependencies?.[depName] ||
      pkg.optionalDependencies?.[depName] ||
      pkg.peerDependencies?.[depName];

    return {
      name: depName,
      version: version || 'not found',
      type: pkg.dependencies?.[depName]
        ? 'dependencies'
        : pkg.devDependencies?.[depName]
          ? 'devDependencies'
          : pkg.optionalDependencies?.[depName]
            ? 'optionalDependencies'
            : pkg.peerDependencies?.[depName]
              ? 'peerDependencies'
              : 'not found',
    };
  }

  /**
   * Get package metadata
   */
  getMetadata() {
    const pkg = this.loadPackage();
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      homepage: pkg.homepage,
      repository: pkg.repository,
      bugs: pkg.bugs,
      license: pkg.license,
      author: pkg.author,
      contributors: pkg.contributors || [],
      engines: pkg.engines || {},
      main: pkg.main,
      bin: pkg.bin || {},
      files: pkg.files || [],
      directories: pkg.directories || {},
    };
  }

  /**
   * Check if script exists
   */
  hasScript(scriptName) {
    const pkg = this.loadPackage();
    return (pkg.scripts || {})[scriptName] ? true : false;
  }

  /**
   * Get script command
   */
  getScriptCommand(scriptName) {
    const pkg = this.loadPackage();
    const cmd = (pkg.scripts || {})[scriptName];

    if (!cmd) {
      throw new Error(`Script "${scriptName}" not found`);
    }

    return {
      script: scriptName,
      command: cmd,
    };
  }

  /**
   * List key configurations
   */
  getConfig() {
    const pkg = this.loadPackage();
    return {
      engines: pkg.engines || {},
      type: pkg.type || 'commonjs',
      main: pkg.main,
      bin: pkg.bin || {},
      exports: pkg.exports || null,
      preferGlobal: pkg.preferGlobal || false,
      workspaces: pkg.workspaces || [],
    };
  }

  /**
   * Get full package.json content (limited fields)
   */
  getFull() {
    const pkg = this.loadPackage();
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      scripts: pkg.scripts || {},
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
      engines: pkg.engines || {},
      license: pkg.license,
    };
  }
}

// Create singleton instance
const instance = new NPMMCPServer();

// Export for MCP integration
module.exports = instance;

// CLI interface for testing
if (require.main === module) {
  try {
    console.log('📦 NPM MCP Server - CLI Mode\n');

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'version') {
      console.log(JSON.stringify(instance.getVersion(), null, 2));
    } else if (command === 'scripts') {
      console.log(JSON.stringify(instance.getScripts(), null, 2));
    } else if (command === 'test-scripts') {
      console.log('Test Scripts:');
      console.log(JSON.stringify(instance.getTestScripts(), null, 2));
    } else if (command === 'dev-scripts') {
      console.log('Dev Scripts:');
      console.log(JSON.stringify(instance.getDevScripts(), null, 2));
    } else if (command === 'dependencies') {
      console.log(JSON.stringify(instance.getDependencies(), null, 2));
    } else if (command === 'dependency') {
      const depName = args[1];
      if (!depName) {
        console.error('Usage: node npm-server.js dependency <name>');
        process.exit(1);
      }
      console.log(JSON.stringify(instance.getDependencyVersion(depName), null, 2));
    } else if (command === 'metadata') {
      console.log(JSON.stringify(instance.getMetadata(), null, 2));
    } else if (command === 'config') {
      console.log(JSON.stringify(instance.getConfig(), null, 2));
    } else if (command === 'full') {
      console.log(JSON.stringify(instance.getFull(), null, 2));
    } else if (command === 'has') {
      const scriptName = args[1];
      if (!scriptName) {
        console.error('Usage: node npm-server.js has <script>');
        process.exit(1);
      }
      console.log(`Script "${scriptName}" exists: ${instance.hasScript(scriptName)}`);
    } else if (command === 'get') {
      const scriptName = args[1];
      if (!scriptName) {
        console.error('Usage: node npm-server.js get <script>');
        process.exit(1);
      }
      console.log(JSON.stringify(instance.getScriptCommand(scriptName), null, 2));
    } else {
      console.log('Usage:');
      console.log('  node npm-server.js version           - Show package version info');
      console.log('  node npm-server.js scripts           - List all npm scripts');
      console.log('  node npm-server.js test-scripts      - List test scripts');
      console.log('  node npm-server.js dev-scripts       - List dev/build scripts');
      console.log('  node npm-server.js dependencies      - Show all dependencies');
      console.log('  node npm-server.js dependency <name> - Get specific dependency version');
      console.log('  node npm-server.js metadata          - Show package metadata');
      console.log('  node npm-server.js config            - Show configuration');
      console.log('  node npm-server.js full              - Show full package summary');
      console.log('  node npm-server.js has <script>      - Check if script exists');
      console.log('  node npm-server.js get <script>      - Get script command');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
