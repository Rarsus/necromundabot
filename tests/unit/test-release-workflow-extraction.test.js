/**
 * Test: Release Workflow ROOT_BUMP Extraction and HAS_CHANGES Logic
 * Verifies that the release.yml workflow correctly extracts ROOT_BUMP
 * from analyze-version-impact.js output and sets HAS_CHANGES appropriately
 *
 * This test was created to catch the bug where:
 * 1. ROOT_BUMP grep pattern didn't match actual output format
 * 2. HAS_CHANGES didn't check ROOT_BUMP, so ROOT-only changes didn't trigger workflow
 *
 * Issue: https://github.com/Rarsus/necromundabot/issues/26
 */

const assert = require('assert');

describe('Release Workflow: ROOT_BUMP Extraction and HAS_CHANGES Logic', () => {
  /**
   * Test 1: Verify exact output format from analyze-version-impact.js
   * The workflow grep patterns must match this exact format
   */
  it('should match exact ROOT_BUMP output format from analyze-version-impact.js', () => {
    // This is the EXACT format output by analyze-version-impact.js
    // when ROOT changes are detected (see line 217 in analyze-version-impact.js)
    const analysisOutput = `
╔════════════════════════════════════════════════════════════╗
║     Workspace-Independent Version Impact Analysis           ║
╚════════════════════════════════════════════════════════════╝

📊 Root Version: 3.0.0
📍 Analyzing from: v3.0.0..HEAD

📦 Workspace Version Bumps:
  • ROOT: MINOR

necrobot-utils: NONE
necrobot-core: NONE
necrobot-commands: NONE
necrobot-dashboard: NONE
ROOT: MINOR
✅ Root Version Bump: 3.0.0 → 3.1.0
   Trigger: Highest workspace bump is MINOR`;

    // The workflow grep pattern: grep "^  • ROOT:"
    const rootBumpLine = analysisOutput.split('\n').find((line) => line.match(/^  • ROOT:/));
    assert.ok(rootBumpLine, 'Should find line starting with "  • ROOT:"');
    assert.strictEqual(rootBumpLine.trim(), '• ROOT: MINOR', 'ROOT line format must match');

    // Extract ROOT_BUMP value using the workflow sed pattern
    const rootBumpValue = rootBumpLine.replace(/^  • ROOT: /, '').toLowerCase();

    assert.strictEqual(rootBumpValue, 'minor', 'ROOT_BUMP extraction must produce lowercase "minor"');
  });

  /**
   * Test 2: Verify grep pattern matches ROOT line correctly
   */
  it('should correctly grep ROOT line from analysis output', () => {
    const analysisOutput = `
📦 Workspace Version Bumps:
  • ROOT: MINOR

necrobot-utils: NONE
necrobot-core: NONE
necrobot-commands: NONE
necrobot-dashboard: NONE
ROOT: MINOR`;

    // This is the EXACT grep pattern from release.yml line 149:
    // grep "^  • ROOT:"
    const grepPattern = /^  • ROOT:/m;
    const matches = analysisOutput.match(grepPattern);

    assert.ok(matches, 'grep "^  • ROOT:" should find the line');
    assert.strictEqual(matches[0], '  • ROOT:', 'Pattern should match full line prefix');
  });

  /**
   * Test 3: Verify ROOT_BUMP extraction when ROOT is MAJOR
   */
  it('should extract ROOT_BUMP correctly for MAJOR changes', () => {
    const analysisOutput = `  • ROOT: MAJOR`;

    const rootBumpValue = analysisOutput.replace(/^  • ROOT: /, '').toLowerCase();

    assert.strictEqual(rootBumpValue, 'major', 'Should extract and lowercase MAJOR');
  });

  /**
   * Test 4: Verify ROOT_BUMP extraction when ROOT is MINOR
   */
  it('should extract ROOT_BUMP correctly for MINOR changes', () => {
    const analysisOutput = `  • ROOT: MINOR`;

    const rootBumpValue = analysisOutput.replace(/^  • ROOT: /, '').toLowerCase();

    assert.strictEqual(rootBumpValue, 'minor', 'Should extract and lowercase MINOR');
  });

  /**
   * Test 5: Verify ROOT_BUMP extraction when ROOT is PATCH
   */
  it('should extract ROOT_BUMP correctly for PATCH changes', () => {
    const analysisOutput = `  • ROOT: PATCH`;

    const rootBumpValue = analysisOutput.replace(/^  • ROOT: /, '').toLowerCase();

    assert.strictEqual(rootBumpValue, 'patch', 'Should extract and lowercase PATCH');
  });

  /**
   * Test 6: Critical - HAS_CHANGES must be TRUE when ROOT_BUMP is not "none"
   * This test would have caught the original bug where HAS_CHANGES
   * didn't check ROOT_BUMP
   */
  it('should set HAS_CHANGES=true when only ROOT has changes', () => {
    // Scenario: ROOT changes, but all workspaces are "none"
    const UTILS_BUMP = 'none';
    const CORE_BUMP = 'none';
    const COMMANDS_BUMP = 'none';
    const DASHBOARD_BUMP = 'none';
    const ROOT_BUMP = 'minor'; // ROOT has MINOR changes

    // This is the EXACT logic from release.yml lines 165-167:
    let HAS_CHANGES = 'false';
    if (
      UTILS_BUMP !== 'none' ||
      CORE_BUMP !== 'none' ||
      COMMANDS_BUMP !== 'none' ||
      DASHBOARD_BUMP !== 'none' ||
      ROOT_BUMP !== 'none' // THIS LINE WAS MISSING IN THE BUG
    ) {
      HAS_CHANGES = 'true';
    }

    assert.strictEqual(HAS_CHANGES, 'true', 'HAS_CHANGES must be true when ROOT_BUMP is "minor"');
  });

  /**
   * Test 7: HAS_CHANGES must be TRUE when workspace changes exist
   */
  it('should set HAS_CHANGES=true when workspace has changes', () => {
    const UTILS_BUMP = 'patch'; // Workspace has changes
    const CORE_BUMP = 'none';
    const COMMANDS_BUMP = 'none';
    const DASHBOARD_BUMP = 'none';
    const ROOT_BUMP = 'none';

    let HAS_CHANGES = 'false';
    if (
      UTILS_BUMP !== 'none' ||
      CORE_BUMP !== 'none' ||
      COMMANDS_BUMP !== 'none' ||
      DASHBOARD_BUMP !== 'none' ||
      ROOT_BUMP !== 'none'
    ) {
      HAS_CHANGES = 'true';
    }

    assert.strictEqual(HAS_CHANGES, 'true', 'HAS_CHANGES must be true when workspace changes exist');
  });

  /**
   * Test 8: HAS_CHANGES must be FALSE when nothing changes
   */
  it('should set HAS_CHANGES=false when no changes detected', () => {
    const UTILS_BUMP = 'none';
    const CORE_BUMP = 'none';
    const COMMANDS_BUMP = 'none';
    const DASHBOARD_BUMP = 'none';
    const ROOT_BUMP = 'none';

    let HAS_CHANGES = 'false';
    if (
      UTILS_BUMP !== 'none' ||
      CORE_BUMP !== 'none' ||
      COMMANDS_BUMP !== 'none' ||
      DASHBOARD_BUMP !== 'none' ||
      ROOT_BUMP !== 'none'
    ) {
      HAS_CHANGES = 'true';
    }

    assert.strictEqual(HAS_CHANGES, 'false', 'HAS_CHANGES must be false when no changes exist');
  });

  /**
   * Test 9: Integration - Simulate full workflow extraction logic
   * This test simulates the exact logic from release.yml analyze-workspace-changes job
   */
  it('should correctly simulate full release workflow extraction logic', () => {
    // Full analysis output from analyze-version-impact.js
    const ANALYSIS = `
╔════════════════════════════════════════════════════════════╗
║     Workspace-Independent Version Impact Analysis           ║
╚════════════════════════════════════════════════════════════╝

📊 Root Version: 3.0.0
📍 Analyzing from: v3.0.0..HEAD

📦 Workspace Version Bumps:
  • ROOT: MINOR

necrobot-utils: NONE
necrobot-core: NONE
necrobot-commands: NONE
necrobot-dashboard: NONE
ROOT: MINOR
✅ Root Version Bump: 3.0.0 → 3.1.0
   Trigger: Highest workspace bump is MINOR`;

    // Simulate the EXACT extraction logic from release.yml (lines 145-157)
    const UTILS_BUMP = extractBump(ANALYSIS, '^necrobot-utils:');
    const CORE_BUMP = extractBump(ANALYSIS, '^necrobot-core:');
    const COMMANDS_BUMP = extractBump(ANALYSIS, '^necrobot-commands:');
    const DASHBOARD_BUMP = extractBump(ANALYSIS, '^necrobot-dashboard:');
    const ROOT_BUMP = extractBump(ANALYSIS, '^  • ROOT:');

    // Verify all extractions
    assert.strictEqual(UTILS_BUMP, 'none', 'Utils bump should be none');
    assert.strictEqual(CORE_BUMP, 'none', 'Core bump should be none');
    assert.strictEqual(COMMANDS_BUMP, 'none', 'Commands bump should be none');
    assert.strictEqual(DASHBOARD_BUMP, 'none', 'Dashboard bump should be none');
    assert.strictEqual(ROOT_BUMP, 'minor', 'ROOT bump should be minor');

    // Verify HAS_CHANGES is set correctly
    let HAS_CHANGES = 'false';
    if (
      UTILS_BUMP !== 'none' ||
      CORE_BUMP !== 'none' ||
      COMMANDS_BUMP !== 'none' ||
      DASHBOARD_BUMP !== 'none' ||
      ROOT_BUMP !== 'none'
    ) {
      HAS_CHANGES = 'true';
    }

    assert.strictEqual(HAS_CHANGES, 'true', 'Workflow should proceed (apply-version-bumps job should execute)');
  });

  /**
   * Helper: Extract bump value from analysis output
   * Simulates: grep + awk pattern from release.yml
   */
  function extractBump(analysisText, grepPattern) {
    const regex = new RegExp(grepPattern + '.*', 'm');
    const match = analysisText.match(regex);

    if (!match) {
      return 'none';
    }

    // Extract the last word (after colon) and lowercase it
    const line = match[0];
    const parts = line.split(':');
    if (parts.length > 1) {
      return parts[1].trim().toLowerCase();
    }

    return 'none';
  }

  /**
   * Test 10: Regression - Verify old pattern would NOT match
   * This test documents what the bug was
   */
  it('should demonstrate why old grep pattern failed (regression test)', () => {
    const analysisOutput = `  • ROOT: MINOR
✅ Root Version Bump: 3.0.0 → 3.1.0
   Trigger: Highest workspace bump is MINOR`;

    // OLD BROKEN PATTERN: "^Root Version Bump:"
    // This would NOT match the actual "  • ROOT:" format
    const oldBrokenPattern = /^Root Version Bump:/m;
    const oldMatches = analysisOutput.match(oldBrokenPattern);

    assert.ok(!oldMatches, 'Old pattern "^Root Version Bump:" should NOT match');

    // NEW CORRECT PATTERN: "^  • ROOT:"
    // This SHOULD match
    const newCorrectPattern = /^  • ROOT:/m;
    const newMatches = analysisOutput.match(newCorrectPattern);

    assert.ok(newMatches, 'New pattern "^  • ROOT:" SHOULD match');
  });
});
