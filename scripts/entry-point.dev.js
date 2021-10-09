#!/usr/bin/env node
const { exec } = require('child_process');
const { readdir } = require('fs').promises;
const path = require('path');

const nativeModules = [];

(async () => {
  try {
    await readdir(path.resolve(__dirname, '..', 'node_modules'));
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
  });
})().then(process.exit);

/** @type {(options: {command: string, description?: string}) => Promise<number>} */
function execute({ command, description }) {
  description && console.info(`[${execute.name}] - ${description}`);
  console.info(`[${execute.name}] > ${command}`);

  const child = exec(command);
  return new Promise((resolve) => {
    child.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    child.on('exit', (code) => {
      resolve(code);
    });
  });
}
