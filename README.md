# NodeOpti

[![NPM Version](https://img.shields.io/npm/v/nodeopti.svg)](https://www.npmjs.com/package/nodeopti)
[![License](https://img.shields.io/npm/l/nodeopti.svg)](https://github.com/your-username/nodeopti/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dt/nodeopti.svg)](https://www.npmjs.com/package/nodeopti)

![NodeOpti](https://raw.githubusercontent.com/LMLK-seal/NodeOpti/refs/heads/main/NodeOpti_logo.jpg)

**Intelligent dependency optimization and code refactoring for Node.js applications**

NodeOpti is a comprehensive command-line tool that analyzes, optimizes, and refactors your Node.js projects. It automatically identifies unused dependencies, applies performance-focused code transformations, and provides detailed insights into your project's dependency graph.

## Key Features

- **Automated dependency cleanup** - Remove unused packages and optimize bundle size
- **Intelligent code refactoring** - Apply performance-focused codemods to your source code
- **Dependency visualization** - Interactive tree view with size and security annotations
- **Development acceleration** - Mock heavy dependencies for faster local development
- **Security analysis** - Identify and address known vulnerabilities

## Installation

```bash
npm install -g nodeopti
```

## Quick Start

```bash
# Analyze your project
nodeopti analyze

# Visualize dependencies
nodeopti tree

# Preview optimizations
nodeopti optimize

# Apply all optimizations
nodeopti optimize --apply
```

## Commands

### `nodeopti analyze`
Provides a comprehensive project health summary including unused dependencies, security vulnerabilities, and optimization opportunities.

### `nodeopti tree`
Renders an interactive dependency tree with package sizes and security risk indicators.

### `nodeopti optimize`
Identifies and applies code optimizations:
- **Dry run** (default): Preview changes without modifying files
- **Apply mode** (`--apply`): Automatically implement all optimizations

### `nodeopti install`
High-performance package installer built on the pnpm engine.

```bash
# Install all dependencies
nodeopti install

# Add new packages
nodeopti install lodash express
```

## Code Transformations

NodeOpti applies intelligent codemods to improve performance and reduce bundle size:

### Lodash Optimizations
```javascript
// Before
const _ = require('lodash');
if (_.isNil(value)) { ... }

// After
const isNil = require('lodash/isNil');
if (value == null) { ... }
```

### Date Handling
```javascript
// Before
moment().format('YYYY-MM-DD')

// After
new Date().toISOString().split('T')[0]
```

## Development Features

### Dependency Virtualization
Speed up local development by mocking heavy dependencies:

**Configuration** (`package.json`):
```json
{
  "nodeOpti": {
    "virtualize": {
      "aws-sdk": { "mock": "./mocks/aws.mock.js" }
    }
  }
}
```

When you run `nodeopti install`, heavy packages are replaced with lightweight mocks, dramatically improving startup times.

### Security & Performance
- Built on the battle-tested pnpm engine
- Disk-space efficient installations
- Vulnerability scanning and reporting
- Bundle size optimization

## Requirements

- Node.js 14.0.0 or higher
- npm 6.0.0 or higher

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/LMLK-Seal/nodeopti/wiki)
- 🐛 [Issue Tracker](https://github.com/LMLK-Seal/nodeopti/issues)
- 💬 [Discussions](https://github.com/LMLK-Seal/nodeopti/discussions)

---

**Made with ❤️ by the NodeOpti team**