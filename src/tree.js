// src/tree.js

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;
const { getPackageSize, getVulnerabilities } = require('./services');

async function getDependencyGraph(projectPath) {
  try {
    const { stdout } = await exec('npm ls --json --all', { maxBuffer: 1024 * 1024 * 10, cwd: projectPath });
    return JSON.parse(stdout);
  } catch (error) {
    if (error.stdout) {
      try { return JSON.parse(error.stdout); } catch (e) {
        throw new Error('Failed to parse npm ls JSON output.');
      }
    }
    throw error;
  }
}

function renderTree(node, prefix = '', isLast = true) {
  if (!node || !node.name) return;
  const elbow = isLast ? '└─' : '├─';
  const nameColor = node.risk.critical > 0 || node.risk.high > 0 ? chalk.red.bold : chalk.cyan;
  const riskParts = [];
  if (node.risk.critical > 0) riskParts.push(chalk.red.bold(`${node.risk.critical}C`));
  if (node.risk.high > 0) riskParts.push(chalk.red(`${node.risk.high}H`));
  if (node.risk.moderate > 0) riskParts.push(chalk.yellow(`${node.risk.moderate}M`));
  const riskString = riskParts.length > 0 ? `[Risk: ${riskParts.join(' ')}]` : '';
  const sizeString = node.size > 0 ? `[${node.size} KB]` : '';
  const annotations = chalk.gray(` ${sizeString} ${riskString}`);
  console.log(`${prefix}${elbow} ${nameColor(node.name)} ${chalk.gray(`@${node.version}`)}${annotations}`);
  const newPrefix = prefix + (isLast ? '   ' : '│  ');
  if (node.children && node.children.length > 0) {
    node.children.forEach((child, index) => {
      renderTree(child, newPrefix, index === node.children.length - 1);
    });
  }
}

async function runTreeVisualizer(projectPath) {
  const spinner = new Spinner(chalk.cyan('%s Building dependency graph...'));
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) throw new Error(`package.json not found in ${projectPath}`);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  const [graph, vulnerabilities] = await Promise.all([
    getDependencyGraph(projectPath),
    getVulnerabilities(projectPath),
  ]);

  spinner.text = chalk.cyan('%s Processing tree and fetching metrics...');
  
  // Use Object.entries to get both the name and the node data
  const topLevelDeps = graph.dependencies ? Object.entries(graph.dependencies) : [];
  
  const topLevelNodes = (await Promise.all(
    topLevelDeps.map(([depName, nodeData]) => {
      // Pass both the name and the data to the processing function
      return processNode(depName, nodeData, vulnerabilities, new Set());
    })
  )).filter(Boolean);

  spinner.stop(true);
  
  console.log(chalk.blue.bold(`\nDependency Tree for: ${pkg.name}@${pkg.version}`));
  console.log(chalk.gray(projectPath));

  if (topLevelNodes.length > 0) {
    topLevelNodes.forEach((child, index) => {
      renderTree(child, '', index === topLevelNodes.length - 1);
    });
  } else {
    console.log('  └─ No dependencies found.');
  }
}

/**
 * The new, correct recursive processing function.
 * @param {string} name - The name of the package.
 * @param {object} node - The data object for the package from `npm ls`.
 */
async function processNode(name, node, vulnerabilities, visited) {
  // Use the passed-in name. The node object itself doesn't have it.
  if (!node || !name || visited.has(`${name}@${node.version}`)) {
    return null;
  }
  visited.add(`${name}@${node.version}`);
  
  const size = await getPackageSize(name);
  const risk = { critical: 0, high: 0, moderate: 0, low: 0 };
  if (vulnerabilities[name]) {
    risk[vulnerabilities[name].severity]++;
  }
  
  // Use Object.entries again for children to pass their names down.
  const children = node.dependencies ? Object.entries(node.dependencies) : [];
  const processedChildren = (await Promise.all(
    children.map(([childName, childNode]) => processNode(childName, childNode, vulnerabilities, visited))
  )).filter(Boolean);
    
  return {
    name: name, // Use the name that was passed in.
    version: node.version,
    size: parseFloat(size),
    risk,
    children: processedChildren,
  };
}

module.exports = { runTreeVisualizer };