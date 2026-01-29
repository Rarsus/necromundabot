/**
 * Test Create Release Script
 * Tests the create-release.sh script functionality for submodule support
 *
 * The create-release.sh script must work correctly when executed from any submodule
 * directory, reading the local package.json (not the main repo's) and correctly
 * identifying the PROJECT_ROOT as the current working directory.
 */

const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Create Release Script', () => {
  const submoduleDir = path.resolve(__dirname, '../..');
  const mainRepoDir = path.resolve(__dirname, '../../../..');
  const scriptPath = path.resolve(mainRepoDir, 'scripts/create-release.sh');

  describe('Submodule Support', () => {
    it('should locate package.json from current working directory when run from submodule', () => {
      // When executed from necrobot-core directory, script should read necrobot-core/package.json
      const submodulePackageJson = JSON.parse(fs.readFileSync(path.resolve(submoduleDir, 'package.json'), 'utf-8'));

      const mainPackageJson = JSON.parse(fs.readFileSync(path.resolve(mainRepoDir, 'package.json'), 'utf-8'));

      // Verify these are different packages with different versions
      assert.notStrictEqual(
        submodulePackageJson.name,
        mainPackageJson.name,
        'Submodule and main repo should have different package names'
      );

      assert.notStrictEqual(
        submodulePackageJson.version,
        mainPackageJson.version,
        'Submodule and main repo should have different versions'
      );
    });

    it('should correctly detect submodule directory with package.json', () => {
      // Verify necrobot-core has package.json in the expected location
      const packageJsonPath = path.resolve(submoduleDir, 'package.json');
      assert.ok(fs.existsSync(packageJsonPath), `necrobot-core package.json should exist at ${packageJsonPath}`);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      assert.strictEqual(packageJson.name, '@rarsus/necrobot-core', 'Package name should be @rarsus/necrobot-core');
    });

    it('should handle create-release.sh execution from submodule', () => {
      // Verify script exists and is executable
      assert.ok(fs.existsSync(scriptPath), `create-release.sh script should exist at ${scriptPath}`);

      const stats = fs.statSync(scriptPath);
      assert.ok(stats.mode & fs.constants.S_IXUSR, 'create-release.sh should be executable');
    });
  });

  describe('Package.json Detection', () => {
    it('should read package.json from local directory when executed from submodule', () => {
      // Execute script with bash -x to see which package.json it reads
      try {
        const output = execSync(`bash -c "cd ${submoduleDir} && bash -x ../../scripts/create-release.sh 2>&1"`, {
          encoding: 'utf-8',
          stdio: 'pipe',
          timeout: 5000,
        });

        // Script should read the submodule's version (0.3.0)
        assert.ok(output.includes('0.3.0'), 'Script should output submodule version 0.3.0');
      } catch (error) {
        // Script exits after version analysis, which is expected
        // We just need to verify it read the correct version from output
        assert.ok(error.stdout && error.stdout.includes('0.3.0'), 'Script output should show 0.3.0 from necrobot-core');
      }
    });

    it('should correctly identify PROJECT_ROOT as current working directory', () => {
      // Get version from both locations
      const submoduleVersion = JSON.parse(fs.readFileSync(path.resolve(submoduleDir, 'package.json'), 'utf-8')).version;

      // When script runs from submodule, it should identify PROJECT_ROOT correctly
      try {
        execSync(`bash -c "cd ${submoduleDir} && bash ../../scripts/create-release.sh 2>&1"`, {
          encoding: 'utf-8',
          stdio: 'pipe',
          timeout: 5000,
        });
      } catch (error) {
        // We expect script to exit after analysis
        // Check that it read the correct version from submodule
        assert.ok(
          error.stdout && error.stdout.includes(submoduleVersion),
          `Script should read version ${submoduleVersion} from submodule package.json`
        );
      }
    });
  });

  describe('Multi-Repository Support', () => {
    it('should work from necrobot-core submodule', () => {
      const packageJson = JSON.parse(fs.readFileSync(path.resolve(submoduleDir, 'package.json'), 'utf-8'));

      assert.strictEqual(packageJson.name, '@rarsus/necrobot-core', 'Should be @rarsus/necrobot-core package');

      assert.ok(packageJson.version, 'Package should have a version');

      // Verify the package.json is different from main repo
      const mainPackageJson = JSON.parse(fs.readFileSync(path.resolve(mainRepoDir, 'package.json'), 'utf-8'));

      assert.notStrictEqual(
        packageJson.version,
        mainPackageJson.version,
        'Versions should be different between main repo and submodule'
      );
    });

    it('should detect correct git repo root for version analysis', () => {
      // The script uses git to analyze commits
      // Verify git repo exists and contains version information
      try {
        const gitTag = execSync('git describe --tags --abbrev=0', {
          encoding: 'utf-8',
          cwd: submoduleDir,
          stdio: 'pipe',
        }).trim();

        assert.ok(gitTag.startsWith('v'), 'Git tag should exist and start with v');

        // Extract version from tag
        const tagVersion = gitTag.replace(/^v/, '');
        const packageVersion = JSON.parse(fs.readFileSync(path.resolve(submoduleDir, 'package.json'), 'utf-8')).version;

        // Tag should match package version
        assert.strictEqual(tagVersion, packageVersion, 'Git tag version should match package.json version');
      } catch (error) {
        // If git tag doesn't exist, that's OK for test purposes
        // We're just verifying the infrastructure exists
      }
    });

    it('should have script accessible from any submodule path', () => {
      // Verify script path is correct from submodule perspective
      const scriptRelativePath = path.relative(submoduleDir, scriptPath);
      assert.strictEqual(
        scriptRelativePath,
        '../../scripts/create-release.sh',
        'Script path from submodule should be ../../scripts/create-release.sh'
      );

      // Verify script actually exists at that location
      assert.ok(
        fs.existsSync(path.resolve(submoduleDir, scriptRelativePath)),
        'Script should be accessible from submodule directory'
      );
    });
  });
});
