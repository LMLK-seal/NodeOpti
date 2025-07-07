// src/analyze.js

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Spinner = require('cli-spinner').Spinner;
const { findProjectFiles } = require('./ast-parser');
const { getVulnerabilities, getUnusedDependencies, getDependencyProfile } = require('./services');
const { printReport } = require('./reporters');

/**
 * The core logic for performing analysis. Returns the analysis object.
 */
async function performAnalysis(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`package.json not found in ${projectPath}`);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const allDependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  const depNames = Object.keys(allDependencies);

  const projectFiles = findProjectFiles(projectPath);

  const [vulnerabilities, unusedByDepcheck] = await Promise.all([
    getVulnerabilities(projectPath),
    getUnusedDependencies(projectPath),
  ]);

  const analysis = {
    pkg,
    projectPath,
    totalDependencies: depNames.length,
    vulnerable: vulnerabilities,
    unused: unusedByDepcheck,
    dependencies: {},
  };

  const promises = depNames.map(depName =>
    getDependencyProfile(depName, projectPath, projectFiles).then(profile => {
      analysis.dependencies[depName] = profile;
    })
  );
  await Promise.all(promises);

  return analysis;
}

/**
 * The CLI-facing function that runs analysis AND prints the report.
 */
async function runAnalysis(projectPath) {
  const spinner = new Spinner(chalk.cyan('%s Analyzing dependencies...'));
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  const analysis = await performAnalysis(projectPath);

  spinner.stop(true);
  printReport(analysis);
}

module.exports = { runAnalysis, performAnalysis }; // Export both