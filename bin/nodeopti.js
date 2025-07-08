#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { runAnalysis } = require('../src/analyze');
const { runOptimizer } = require('../src/optimize');
const { runInstaller } = require('../src/install');
const { runTreeVisualizer } = require('../src/tree');
const path = require('path');

yargs(hideBin(process.argv))
  .command(
    'analyze [path]',
    'Analyze dependencies in a Node.js project',
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
        await runAnalysis(projectPath);
      } catch (error) {
        console.error(`\n❌ Error during analysis: ${error.message}`);
        process.exit(1);
      }
    }
  )
  // --- START: THE CORRECTED OPTIMIZE COMMAND ---
  .command(
    'optimize [path]',
    'Find and apply optimizations to package.json',
    (yargs) => {
      // THIS PART WAS MISSING. It defines the --apply flag.
      return yargs
        .positional('path', {
          describe: 'Path to the project directory',
          default: '.',
          normalize: true,
        })
        .option('apply', {
          alias: 'a',
          type: 'boolean',
          description: 'Apply the changes directly to package.json',
          default: false,
        })
        .option('pr', {
          type: 'boolean',
          description: 'Generate a markdown summary for a pull request',
          default: false,
        });
    },
    async (argv) => {
      // THIS PART WAS MISSING. It runs the optimizer logic.
      try {
        const projectPath = path.resolve(argv.path);
        await runOptimizer(projectPath, { apply: argv.apply, pr: argv.pr });
      } catch (error) {
        console.error(`\n❌ Error during optimization: ${error.message}`);
        process.exit(1);
      }
    }
  )
  // --- END: THE CORRECTED OPTIMIZE COMMAND ---
  .command(
    'install [packages...]',
    'Install dependencies and apply virtualization',
    (yargs) => {
      return yargs.positional('packages', {
        describe: 'Optional list of packages to add',
        type: 'string',
      });
    },
    async (argv) => {
      try {
        const projectPath = path.resolve(process.cwd());
        await runInstaller(projectPath, argv.packages);
      } catch (error) {
        console.error(`\n❌ Error during install: ${error.message}`);
        process.exit(1);
      }
    }
  )
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
  .demandCommand(1, 'You must specify a command.')
  .help()
  .alias('h', 'help')
  .strict()
  .parse();