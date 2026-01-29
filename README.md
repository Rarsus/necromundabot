# NecromundaBot

A comprehensive Discord bot for Necromunda role-playing games, built with Node.js, Discord.js, and npm workspaces.

## 📦 Repository Structure

This is a monorepo with 4 npm workspaces:

```
repos/
├── necrobot-core          # Discord.js client, events, command loading
├── necrobot-utils         # Shared services (DatabaseService), middleware, helpers
├── necrobot-commands      # All Discord commands by category
└── necrobot-dashboard     # React/Next.js web UI
```

Each workspace has:

- Independent `package.json`
- Own test suite
- Isolated git history (git submodules)

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- Docker (optional, for containerized deployment)

### Installation

```bash
# Install all workspace dependencies
npm install

# Validate workspace setup
npm run workspaces:validate

# Run all tests
npm test

# Check workspace status
npm run workspaces:status
```

### Development

```bash
# Run tests in watch mode
npm run test:watch

# Lint all code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Start bot locally (requires .env configuration)
npm start
```

### Docker

```bash
# Build Docker image
docker build -t necromundabot .

# Run with docker-compose
docker-compose up --build -d

# View logs
docker logs necromundabot -f
```

## 📚 Documentation

- **[User Guides](./docs/user-guides/)** - How to use the bot and features
- **[Developer Guides](./docs/guides/)** - Development workflows and patterns
- **[Architecture](./docs/architecture/)** - System design and components
- **[Testing](./docs/testing/)** - Test strategies and coverage
- **[Project Documentation](./project-docs/)** - Phase deliverables and planning

## 📋 Key Documentation Files

### Governance (Root Level)

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contributing guidelines
- [CONTRIBUTING-MONOREPO.md](./CONTRIBUTING-MONOREPO.md) - Monorepo-specific workflow
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards
- [DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md) - Acceptance criteria
- [DOCUMENT-NAMING-CONVENTION.md](./DOCUMENT-NAMING-CONVENTION.md) - Documentation standards

### Developer Resources

- [docs/guides/](./docs/guides/) - Development and testing guides
- [docs/user-guides/](./docs/user-guides/) - User-facing documentation
- [docs/architecture/](./docs/architecture/) - System architecture docs
- [docs/testing/](./docs/testing/) - Test strategies and patterns

### Project Management

- [project-docs/](./project-docs/) - Phase deliverables and infrastructure docs
- [project-docs/PHASE-03.3/](./project-docs/PHASE-03.3/) - Current phase documentation

## 🧪 Testing

```bash
# Run all tests across all workspaces
npm test

# Run tests for specific workspace
npm test --workspace=repos/necrobot-core

# Run tests with coverage
npm run test:coverage

# Run quick test suite (for CI/CD)
npm run test:quick
```

**Coverage Requirements:**

- Core Services: 85%+
- Commands: 80%+
- Utilities: 90%+
- New Features: 90%+

## 🔒 Security

Security scanning is automated via GitHub Actions:

- **npm audit** with baseline tracking
- **ESLint security rules**
- **SAST analysis** (Semgrep)
- **Secret detection**

Check results: [GitHub Security](https://github.com/Rarsus/necromundabot/security)

## 📦 Publishing

Packages are published to GitHub Packages with automated sequential publishing:

```
1. necrobot-utils (base library)
   ↓
2. necrobot-core (depends on utils)
   ↓
3. necrobot-commands (depends on core)
   ↓
4. necrobot-dashboard (depends on commands)
```

### Install Published Packages

```bash
# Configure npm for GitHub Packages
npm config set @rarsus:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN

# Install packages
npm install @rarsus/necrobot-utils
npm install @rarsus/necrobot-core
npm install @rarsus/necrobot-commands
```

## 🔄 Workflow

### Development Workflow

1. Create feature branch
2. Make changes with tests (TDD-first approach)
3. Run `npm test` locally
4. Commit changes (Husky pre-commit hooks auto-fix formatting)
5. Push to GitHub
6. Automated tests and security checks run
7. Create pull request
8. Code review and merge
9. Automated publishing pipeline runs

### Command Structure

All Discord commands follow this pattern:

```javascript
module.exports = {
  name: 'command-name',
  description: 'User-facing description',
  data: new SlashCommandBuilder().setName('command-name').setDescription('User-facing description'),
  async executeInteraction(interaction) {
    // Command logic
  },
};
```

See [Copilot Instructions](./docs/reference/copilot-reference.md) for details.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DATABASE_PATH=./data/necromunda.db
NODE_ENV=development
```

### npm Workspace Scripts

```bash
npm run workspaces:validate  # Validate monorepo structure
npm run workspaces:status   # Show workspace health
npm run lint                # Lint all workspaces
npm run test:quick          # Fast test suite for CI
npm run validate:docs       # Validate documentation
```

## 📊 Project Status

| Component          | Version | Status         |
| ------------------ | ------- | -------------- |
| necrobot-core      | 0.3.4   | ✅ Operational |
| necrobot-utils     | 0.2.4   | ✅ Operational |
| necrobot-commands  | 0.3.0   | ✅ Operational |
| necrobot-dashboard | 0.2.3   | ✅ Operational |

**GitHub Actions:** ✅ All 11 workflows valid and operational

**Test Coverage:** 145/145 tests passing

## 🎯 Roadmap

### Phase 03.3 (Current)

- ✅ Workflow validation complete
- ✅ Docker optimization
- ✅ Husky pre-commit hooks
- ⏳ Full monorepo integration

### Phase 03.1+ (Upcoming)

- discord.js v15 migration (when stable)
- Enhanced security scanning
- Additional monitoring and metrics

## 🤝 Contributing

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Read [CONTRIBUTING-MONOREPO.md](./CONTRIBUTING-MONOREPO.md)
3. Follow [Copilot Instructions](./docs/reference/copilot-reference.md)
4. Use TDD workflow (tests before code)
5. Ensure all tests pass: `npm test`
6. Follow code formatting: `npm run lint:fix`

## 📝 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## 👥 Support

- 📖 [Documentation](./docs/)
- 🐛 [GitHub Issues](https://github.com/Rarsus/necromundabot/issues)
- 💬 [GitHub Discussions](https://github.com/Rarsus/necromundabot/discussions)

## 🔗 Links

- [GitHub Repository](https://github.com/Rarsus/necromundabot)
- [GitHub Packages](https://github.com/Rarsus?tab=packages)
- [Discord.js Documentation](https://discord.js.org)
- [npm Registry](https://www.npmjs.com)

---

**Last Updated:** January 29, 2026  
**Current Version:** v0.5.1  
**Node.js Requirement:** >= 22.0.0  
**npm Requirement:** >= 10.0.0
