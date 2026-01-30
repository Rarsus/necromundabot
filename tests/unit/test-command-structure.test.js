/**
 * Test Command Structure Validation
 * Verifies that the commands module has the correct folder structure
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('Command Structure', () => {
  const commandsDir = path.join(__dirname, '../../src/commands');

  describe('directory structure', () => {
    it('should have a commands directory', () => {
      assert(fs.existsSync(commandsDir), 'Commands directory should exist');
      assert(fs.statSync(commandsDir).isDirectory(), 'Commands should be a directory');
    });

    it('should have all required command categories', () => {
      const requiredCategories = ['misc', 'battle', 'campaign', 'gang', 'social'];
      const categories = fs.readdirSync(commandsDir);

      for (const category of requiredCategories) {
        const categoryPath = path.join(commandsDir, category);
        assert(fs.existsSync(categoryPath), `Category ${category} should exist`);
        assert(fs.statSync(categoryPath).isDirectory(), `Category ${category} should be a directory`);
      }
    });

    it('should not have any folders with braces in name', () => {
      const categories = fs.readdirSync(commandsDir);
      for (const category of categories) {
        assert(!category.includes('{') && !category.includes('}'), `Category "${category}" should not contain braces`);
      }
    });

    it('should have misc category with command files', () => {
      const miscPath = path.join(commandsDir, 'misc');
      const files = fs.readdirSync(miscPath);

      // Check for expected command files
      assert(
        files.some((f) => f.endsWith('.js')),
        'misc folder should contain JavaScript files'
      );
    });
  });

  describe('command file naming', () => {
    it('should have properly named command files in misc', () => {
      const miscPath = path.join(commandsDir, 'misc');
      const jsFiles = fs.readdirSync(miscPath).filter((f) => f.endsWith('.js'));

      assert(jsFiles.length > 0, 'misc category should have command files');

      for (const file of jsFiles) {
        // File should be in kebab-case (lowercase with hyphens)
        assert(/^[a-z-]+\.js$/.test(file), `File "${file}" should follow kebab-case naming convention`);
      }
    });

    it('should not have files with closing braces in name', () => {
      const miscPath = path.join(commandsDir, 'misc');
      const files = fs.readdirSync(miscPath);

      for (const file of files) {
        assert(!file.includes('}'), `File "${file}" should not contain closing braces`);
      }
    });
  });

  describe('command category readiness', () => {
    const categories = ['misc', 'battle', 'campaign', 'gang', 'social'];

    for (const category of categories) {
      describe(`${category} category`, () => {
        it(`should exist`, () => {
          const categoryPath = path.join(commandsDir, category);
          assert(fs.existsSync(categoryPath), `${category} category should exist`);
        });

        it('should be a directory', () => {
          const categoryPath = path.join(commandsDir, category);
          assert(fs.statSync(categoryPath).isDirectory(), `${category} should be a directory`);
        });
      });
    }
  });

  describe('folder structure compliance', () => {
    it('should match the architecture specification', () => {
      // Expected structure from copilot-instructions.md
      const expectedStructure = {
        misc: 'General utility commands',
        battle: 'Battle management commands',
        campaign: 'Campaign management commands',
        gang: 'Gang management commands',
        social: 'Social feature commands',
      };

      for (const [category, description] of Object.entries(expectedStructure)) {
        const categoryPath = path.join(commandsDir, category);
        assert(fs.existsSync(categoryPath), `${description} (${category}) should exist`);
      }
    });

    it('should not contain any incorrect folder naming patterns', () => {
      const allItems = fs.readdirSync(commandsDir, { withFileTypes: true });

      for (const item of allItems) {
        const name = item.name;

        // Check for common naming mistakes
        assert(!name.startsWith('{'), `Folder "${name}" should not start with opening brace`);
        assert(!name.endsWith('}'), `Folder "${name}" should not end with closing brace`);
        assert(!name.includes(' '), `Folder "${name}" should not contain spaces`);
      }
    });
  });
});
