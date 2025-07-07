// src/virtualize.js

const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

const PROXY_DIR_NAME = '.nodeopti-proxies';

/**
 * Checks for virtualization config and applies it.
 * @param {string} projectPath The absolute path to the project root.
 * @param {object} pkg The project's package.json content.
 */
async function applyVirtualization(projectPath, pkg) {
  const config = pkg.nodeOpti;
  if (!config || !config.virtualize || Object.keys(config.virtualize).length === 0) {
    // console.log(chalk.gray('No virtualization config found in package.json. Skipping.'));
    return;
  }

  console.log(chalk.cyan.bold('\n🔎 Applying dependency virtualization...'));

  const proxyDirPath = path.join(projectPath, 'node_modules', PROXY_DIR_NAME);
  await fs.mkdir(proxyDirPath, { recursive: true });

  for (const [pkgName, pkgConfig] of Object.entries(config.virtualize)) {
    if (!pkgConfig.mock) {
      console.warn(chalk.yellow(`⚠️  Skipping virtualization for "${pkgName}": "mock" path is missing.`));
      continue;
    }

    const mockPath = path.resolve(projectPath, pkgConfig.mock);
    if (!(await fs.stat(mockPath).catch(() => false))) {
       console.warn(chalk.yellow(`⚠️  Skipping virtualization for "${pkgName}": Mock file not found at ${mockPath}.`));
       continue;
    }
    
    await createProxyPackage(projectPath, proxyDirPath, pkgName, mockPath);
    console.log(`  ✅ Virtualized "${pkgName}" to use mock: ${pkgConfig.mock}`);
  }
}

/**
 * Replaces a real package in node_modules with a lightweight shim.
 */
async function createProxyPackage(projectPath, proxyDirPath, pkgName, mockPath) {
  const pkgShimPath = path.join(projectPath, 'node_modules', pkgName);
  const proxyFilePath = path.join(proxyDirPath, `${pkgName.replace('/', '_')}.js`);

  // 1. Remove the original package installed by pnpm
  await fs.rm(pkgShimPath, { recursive: true, force: true });

  // 2. Create the new directory for our shim package
  await fs.mkdir(pkgShimPath, { recursive: true });

  // 3. Create the proxy JS file that points to the user's mock
  // We need a relative path from the proxy file to the mock file
  const relativeMockPath = path.relative(path.dirname(proxyFilePath), mockPath).replace(/\\/g, '/');
  const proxyFileContent = `// NodeOpti Virtualization Proxy
module.exports = require('${relativeMockPath}');
`;
  await fs.writeFile(proxyFilePath, proxyFileContent);

  // 4. Create the fake package.json that tells Node to use our proxy file
  const shimPackageJson = {
    name: pkgName,
    version: '0.0.0-nodeopti-virtualized',
    main: path.relative(pkgShimPath, proxyFilePath).replace(/\\/g, '/'),
  };
  await fs.writeFile(
    path.join(pkgShimPath, 'package.json'),
    JSON.stringify(shimPackageJson, null, 2)
  );
}

module.exports = { applyVirtualization };