#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runAnalysis } = require('../src/analyze');
const { runOptimizer } = require('../src/optimize');
const { runInstaller } = require('../src/install');
const { runTreeVisualizer } = require('../src/tree'); // <-- NEW IMPORT
const path = require('path');

yargs(hideBin(process.argv))
  .command(
    'analyze [path]',
    'Analyze dependencies in a Node.js project',
    // ... (analyze command code)
  )
  .command(
    'optimize [path]',
    'Find and apply optimizations to package.json',
    // ... (optimize command code)
  )
  .command(
    'install [packages...]',
    'Install dependencies and apply virtualization',
    // ... (install command code)
  )
  // --- NEW COMMAND ---
  .command(
    'tree [path]',
    'Visualize the project dependency tree with metrics',
    (yargs) => {
      return yargs.positional('path', {
        describe: 'Path to the project directory',
        default: '.',
        normalize: true,
      });
    },
    async (argv) => {
      try {
        const projectPath = path.resolve(argv.path);
        await runTreeVisualizer(projectPath);
      } catch (error) {
        console.error(`\n❌ Error generating dependency tree: ${error.message}`);
        process.exit(1);
      }
    }
  )
  // --- END NEW COMMAND ---
  .demandCommand(1, 'You must specify a command.')
  .help()
  .alias('h', 'help')
  .strict()
  .parse();