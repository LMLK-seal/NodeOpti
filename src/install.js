// src/install.js

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { applyVirtualization } = require('./virtualize');

/**
 * Runs the full installation process.
 * 1. Executes `pnpm install`.
 * 2. Applies virtualization based on config.
 */
async function runInstaller(projectPath, packages = []) {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in ${projectPath}`);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  // Step 1: Run the actual installer (pnpm)
  console.log(chalk.blue.bold(`🚀 Running installer via pnpm engine...`));
  const success = await executePnpm(projectPath, packages);

  if (!success) {
    throw new Error('The package installation process failed.');
  }

  // Step 2: Apply virtualization
  await applyVirtualization(projectPath, pkg);

  console.log(chalk.green.bold('\n✨ NodeOpti install complete!'));
}

/**
 * Executes pnpm with the given arguments, streaming its output.
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
function executePnpm(projectPath, packages) {
  return new Promise((resolve) => {
    const pnpmPath = require.resolve('pnpm');
    const args = ['install', ...packages];

    const child = spawn(process.execPath, [pnpmPath, ...args], {
      cwd: projectPath,
      stdio: 'inherit', // This streams pnpm's output/input/errors to our terminal
    });

    child.on('close', (code) => {
      resolve(code === 0);
    });

    child.on('error', (err) => {
      console.error(chalk.red('Failed to start pnpm.'), err);
      resolve(false);
    });
  });
}

module.exports = { runInstaller };