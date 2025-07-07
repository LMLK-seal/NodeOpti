// src/ast-parser.js

const fs = require('fs').promises;
const path = require('path');
const fg = require('fast-glob'); // Replaced 'glob' with 'fast-glob'
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const chalk = require('chalk');

const findProjectFiles = (projectPath) => {
  // fast-glob is much better at handling cross-platform paths.
  // We provide it with patterns that work everywhere.
  const patterns = ['**/*.{js,jsx,ts,tsx}'];
  return fg.sync(patterns, {
    cwd: projectPath,
    ignore: ['node_modules', '**/.*', '**/*config.js', 'dist', 'build'],
    absolute: false, // We want relative paths
    onlyFiles: true,
  });
};

async function analyzeUsage(dependencyName, projectFiles, projectPath) {
  let isUsed = false;
  for (const file of projectFiles) {
    if (isUsed) break; // Stop checking once we find a usage
    try {
      const filePath = path.join(projectPath, file);
      const code = await fs.readFile(filePath, 'utf-8');

      const ast = parser.parse(code, {
        sourceType: 'unambiguous',
        allowHashbang: true,
        plugins: ['jsx', 'typescript'],
        errorRecovery: true,
      });

      traverse(ast, {
        enter(astPath) {
          if (
            (astPath.isImportDeclaration() || (astPath.isCallExpression() && astPath.get('callee').isIdentifier({ name: 'require' })))
          ) {
            const sourceNode = astPath.isImportDeclaration() ? astPath.get('source') : astPath.get('arguments.0');
            if (sourceNode.isStringLiteral()) {
                const importSource = sourceNode.node.value;
                if (importSource === dependencyName || importSource.startsWith(`${dependencyName}/`)) {
                    isUsed = true;
                    astPath.stop();
                }
            }
          }
        }
      });
    } catch (e) { /* Ignore parsing errors */ }
  }
  return { isUsed };
}

async function getPackageExports(dependencyName, projectPath, projectFiles) {
    const { isUsed } = await analyzeUsage(dependencyName, projectFiles, projectPath);
    return { isUsed };
}

module.exports = { findProjectFiles, getPackageExports };