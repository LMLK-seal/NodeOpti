// This is our lightweight, fake "chalk" library.
// It doesn't apply colors; it just returns the original string,
// but it prints a message so we know it's working.

console.log('--- VIRTUALIZED MOCK-CHALK LOADED ---');

// The real chalk library returns a function that can also be an object.
// We need to mimic this structure for compatibility.

// The base function just returns the string.
const chalkMock = (str) => str;

// Attach mock style functions that also just return the string.
chalkMock.red = (str) => str;
chalkMock.green = (str) => str;
chalkMock.yellow = (str) => str;
chalkMock.blue = (str) => str;
chalkMock.magenta = (str) => str;
chalkMock.cyan = (str) => str;
chalkMock.gray = (str) => str;

// The real chalk uses chained styles like chalk.red.bold('text').
// We can mimic this by making each function return the same object.
const chainable = new Proxy(chalkMock, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    // For any other property (like .bold), just return the same object
    // so we can chain infinitely, e.g., chalk.red.bold.underline.
    return chainable;
  }
});

module.exports = chainable;