const assert = require('assert');
const { applyLodashIsNilOptimization } = require('../src/codemods');

async function run() {
  // Test case 1: A file with a clear optimization opportunity
  const sourceCode = `
    const _ = require('lodash');
    const isItNil = _.isNil(someVariable);
  `;
  const expectedCode = `const _ = require('lodash');
const isItNil = someVariable == null;`;
  
  const result = applyLodashIsNilOptimization(sourceCode);
  assert.strictEqual(result.changes, 1, 'Test 1 Failed: Should find 1 change.');
  assert.strictEqual(result.code.trim(), expectedCode.trim(), 'Test 1 Failed: Code transformation is incorrect.');

  // Test case 2: A file with no opportunity
  const noChangeSource = `const x = 1;`;
  const noChangeResult = applyLodashIsNilOptimization(noChangeSource);
  assert.strictEqual(noChangeResult.changes, 0, 'Test 2 Failed: Should find 0 changes.');
}

module.exports = { run };