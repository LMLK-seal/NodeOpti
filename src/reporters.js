// src/reporters.js

const chalk = require('chalk');
const Table = require('cli-table3');

function formatSize(kb) {
  if (kb === 0 || !kb) return chalk.gray('N/A');
  if (kb < 1024) return chalk.green(`${kb} KB`);
  return chalk.yellow(`${(kb / 1024).toFixed(2)} MB`);
}

function formatRisk(vulns) {
  if (vulns.critical > 0) return chalk.red.bold(`${vulns.critical} C`);
  if (vulns.high > 0) return chalk.red(`${vulns.high} H`);
  if (vulns.moderate > 0) return chalk.yellow(`${vulns.moderate} M`);
  if (vulns.low > 0) return chalk.gray(`${vulns.low} L`);
  return chalk.green('✓');
}

function printReport(analysis) {
  console.log('\n✅  NodeOpti Analysis Complete');

  const summaryTable = new Table({
      head: [chalk.bold('Metric'), chalk.bold('Result')],
      colWidths: [25, 50]
  });
  summaryTable.push(
      ['Total Dependencies', analysis.totalDependencies],
      ['Unused Dependencies', chalk.red(analysis.unused.length)],
      ['Vulnerable Dependencies', chalk.yellow(Object.keys(analysis.vulnerable).length)]
  );
  console.log(summaryTable.toString());

  if (analysis.unused.length > 0) {
    console.log(chalk.red.bold('\n🗑️  Unused Dependencies (can likely be removed):'));
    console.log(chalk.gray(analysis.unused.join(', ')));
  }

  console.log(chalk.blue.bold('\n🔎  Dependency Details:'));
  const detailsTable = new Table({
    head: [ 'Dependency', 'Size', 'Risk', 'Usage' ],
    colWidths: [30, 15, 10, 25],
  });

  const sortedDeps = Object.keys(analysis.dependencies).sort();

  for (const depName of sortedDeps) {
    const dep = analysis.dependencies[depName];
    if (!dep) continue;

    const isUnused = analysis.unused.includes(depName);
    const usageText = isUnused ? chalk.red.bold('Unused') : chalk.green('In Use');

    detailsTable.push([
        chalk.cyan(depName),
        formatSize(dep.size),
        formatRisk(dep.vulnerabilities),
        usageText
    ]);
  }
  console.log(detailsTable.toString());
}

module.exports = { printReport };