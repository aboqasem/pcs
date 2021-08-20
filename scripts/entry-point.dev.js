#!/usr/bin/env node
const { exec } = require('child_process');
const { readdir } = require('fs').promises;
const path = require('path');

(async () => {
  try {
    await readdir(path.resolve(__dirname, '..', 'node_modules'));
  } catch (error) {
    await execute({
      command: 'npm install',
      description: 'No node_modules found, running npm install...',
    });
  }

  try {
    const bcrypt = require('bcrypt');
    const hash = bcrypt.hashSync('should work', 10);
    bcrypt.compareSync('should work', hash);
  } catch (error) {
    await execute({
      command: 'npm install bcrypt',
      description: 'bcrypt does not work, reinstalling...',
    });
  }

  return execute({
    command: 'npx nx run-many --target=serve --projects=web,bff --parallel',
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
