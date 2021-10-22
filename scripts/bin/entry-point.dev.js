#!/usr/bin/env ts-node
// @ts-check
const { readdir } = require('fs/promises');
const path = require('path');
const { execute } = require('./utils/execute');

/** @type {string[]} */
const nativeModules = [];

async function main() {
  try {
    await readdir(path.resolve(__dirname, '..', '..', 'node_modules'));
  } catch (e) {
    await execute({
      command: 'pnpm install',
      description: 'No node_modules found, running pnpm install...',
    });
  }

  for (const module of nativeModules) {
    try {
      require(module);
    } catch (e) {
      await execute({
        command: `npx rimraf node_modules/${module}/ && pnpm install ${module}`,
        description: `${module} needs reinstalling...`,
      });
    }
  }

  return execute({
    command: 'pnpm nx -- run-many --target=serve --projects=web,bff --parallel',
    description: 'Serving projects web and bff...',
  }).then(({ code }) => process.exit(code));
}

main();
