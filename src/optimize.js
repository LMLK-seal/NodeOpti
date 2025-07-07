// src/optimize.js

const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');
const inquirer = require('inquirer');
const Spinner = require('cli-spinner').Spinner;
const { performAnalysis } = require('./analyze');
const { findProjectFiles } = require('./ast-parser');
const { 
  applyLodashIsNilOptimization,
  applyLodashNamedImportsOptimization,
  applyMomentFormatOptimization,
} = require('./codemods');

async function runOptimizer(projectPath, options) {
  const spinner = new Spinner(chalk.cyan('%s Analyzing for optimizations...'));
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  
  const analysis = await performAnalysis(projectPath);
  spinner.stop(true);

  const { unused } = analysis;
  const hasUnusedDeps = unused.length > 0;

  if (!options.apply && !options.pr && !hasUnusedDeps) {
    console.log(chalk.green.bold('✅ No unused dependencies found.'));
    console.log(chalk.cyan('Run with --apply to check for code-level optimizations.'));
    return;
  }
  
  if (!options.apply && !options.pr) {
    console.log(chalk.yellow.bold('🔍 Found opportunities for optimization (dry run):'));
    if (hasUnusedDeps) {
      console.log(chalk.red('\nThe following packages are unused and can be removed:'));
      unused.forEach(dep => console.log(`  - ${dep}`));
    }
    console.log(chalk.cyan('\nRun with the --apply flag to apply all optimizations.'));
    return;
  }
  
  if (options.apply) {
    await applyChanges(analysis);
  }

  if (options.pr) {
    generatePRSummary(analysis);
  }
}

async function applyChanges(analysis) {
  const { unused, pkg, projectPath } = analysis;
  let changesMade = false;
  
  if (unused.length > 0) {
    console.log(chalk.yellow(`Found ${unused.length} unused package(s) to remove.`));
    unused.forEach(depName => {
      delete pkg.dependencies?.[depName];
      delete pkg.devDependencies?.[depName];
    });

    const pkgPath = path.join(projectPath, 'package.json');
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(chalk.green('  ✅ package.json has been updated.'));
    
    const spinner = new Spinner(chalk.cyan('%s Running `npm install`...'));
    spinner.setSpinnerString('|/-\\');
    spinner.start();
    try {
      await exec('npm install', { cwd: projectPath });
      spinner.stop(true);
      console.log(chalk.green('  ✅ Unused packages have been removed from node_modules.'));
      changesMade = true;
    } catch (error) {
      spinner.stop(true);
      console.error(chalk.red('❌ Error running `npm install`.'), error);
      return;
    }
  }

  console.log(chalk.cyan('\n🔍 Searching for code-level optimizations...'));
  const projectFiles = findProjectFiles(projectPath);
  let totalCodemodChanges = 0;
  
  for (const file of projectFiles) {
    try {
      const filePath = path.join(projectPath, file);
      let sourceCode = await fs.readFile(filePath, 'utf-8');
      let fileChanges = 0;

      // --- START: Codemod Pipeline ---
      const momentResult = applyMomentFormatOptimization(sourceCode);
      fileChanges += momentResult.changes;
      
      const lodashResult1 = applyLodashIsNilOptimization(momentResult.code);
      fileChanges += lodashResult1.changes;
      
      const lodashResult2 = applyLodashNamedImportsOptimization(lodashResult1.code);
      fileChanges += lodashResult2.changes;
      // --- END: Codemod Pipeline ---
      
      if (fileChanges > 0) {
        await fs.writeFile(filePath, lodashResult2.code); // Write the final transformed code
        console.log(chalk.green(`  ✨ Optimized ${fileChanges} item(s) in ${file}`));
        totalCodemodChanges += fileChanges;
      }
    } catch (e) { 
      console.warn(chalk.yellow(`  ⚠️  Could not process ${file}. Skipping.`));
    }
  }

  if (totalCodemodChanges > 0) {
    console.log(chalk.green.bold(`\n✨ Successfully applied ${totalCodemodChanges} code optimizations!`));
    changesMade = true;
  } else {
    console.log(chalk.gray('No applicable code optimizations were found.'));
  }

  if (!changesMade && unused.length === 0) {
    console.log(chalk.green.bold("\n✅ No changes were needed. Your project is already optimized!"));
  }
}

function generatePRSummary(analysis) {
  const { unused } = analysis;
  const removedCount = unused.length;
  const summary = `
### 🤖 NodeOpti Optimization Summary
- **Removed ${removedCount} unused package(s).**
#### 🗑️ Unused Packages Removed:
${unused.map(dep => `- \`${dep}\``).join('\n')}
`;
  console.log(chalk.blue.bold('--- PR SUMMARY ---'));
  console.log(summary);
  console.log(chalk.blue.bold('--- END PR SUMMARY ---'));
}

module.exports = { runOptimizer };