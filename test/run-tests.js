// A very simple test runner
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const testFiles = fs.readdirSync(__dirname).filter(f => f.startsWith('test-') && f.endsWith('.js'));
let failures = 0;

(async () => {
  for (const file of testFiles) {
    console.log(chalk.yellow(`\nRunning test suite: ${file}...`));
    try {
      const testModule = require(path.join(__dirname, file));
      await testModule.run(); // Assuming each test file exports a run function
      console.log(chalk.green(`✅ Suite Passed: ${file}`));
    } catch (error) {
      console.error(chalk.red.bold(`❌ Suite FAILED: ${file}`));
      console.error(error);
      failures++;
    }
  }

  if (failures > 0) {
    console.error(chalk.red.bold(`\n${failures} test suite(s) failed.`));
    process.exit(1);
  } else {
    console.log(chalk.green.bold('\nAll tests passed! ✨'));
  }
})();