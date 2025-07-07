// src/services.js

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const depcheck = require('depcheck');
const { getPackageExports } = require('./ast-parser');

async function getVulnerabilities(projectPath) {
  try {
    const { stdout } = await exec('npm audit --json', { cwd: projectPath });
    return JSON.parse(stdout).vulnerabilities;
  } catch (error) {
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout).vulnerabilities;
      } catch (e) {
        console.warn('\n⚠️  Could not parse npm audit JSON output.');
        return {};
      }
    }
    console.warn('\n⚠️  Could not run npm audit. Is package-lock.json present?');
    return {};
  }
}

async function getUnusedDependencies(projectPath) {
  const options = {
    ignoreBinPackage: false,
    skipMissing: false,
    ignorePatterns: [ 'node_modules', 'build', 'dist' ],
  };
  const results = await depcheck(projectPath, options);
  return results.dependencies;
}

async function getPackageSize(packageName) {
  try {
    const { stdout } = await exec(`npm view ${packageName} dist.unpackedSize --json`);
    return stdout ? (parseInt(JSON.parse(stdout), 10) / 1024).toFixed(2) : 0;
  } catch (e) {
    return 0;
  }
}

async function getDependencyProfile(depName, projectPath, projectFiles) {
  const [size, usageStatus] = await Promise.all([
    getPackageSize(depName),
    getPackageExports(depName, projectPath, projectFiles)
  ]);

  return {
    size: size,
    isUsed: usageStatus.isUsed,
    vulnerabilities: { high: 0, moderate: 0, low: 0, critical: 0 },
  };
}

// --- THIS IS THE CORRECTED LINE ---
// We now correctly export getPackageSize so other files can use it.
module.exports = {
  getVulnerabilities,
  getUnusedDependencies,
  getDependencyProfile,
  getPackageSize,
};