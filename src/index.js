// This file serves as the main entry point for programmatic usage of NodeOpti.

const { performAnalysis, runAnalysis } = require('./analyze');
const { runOptimizer } = require('./optimize');
const { runInstaller } = require('./install');
const { runTreeVisualizer } = require('./tree');

module.exports = {
  // Core Logic (for other tools to use)
  performAnalysis,

  // Command Runners (to call from other scripts)
  runAnalysis,
  runOptimizer,
  runInstaller,
  runTreeVisualizer,
};