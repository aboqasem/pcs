// @ts-check
const { exec } = require('child_process');

/**
 * @typedef {{ command: string; description?: string; } | string} CommandOptions
 * @typedef {{ outData?: string; errData?: string; code?: number }} CommandOutput
 */

/** @type {(options: CommandOptions) => Promise<CommandOutput>} */
function execute(options) {
  const command = typeof options === 'object' ? options.command : options;
  const description = typeof options === 'object' ? options.description : undefined;

  description && console.info(`[${execute.name}] - ${description}`);
  console.info(`[${execute.name}] > ${command}`);

  const child = exec(command);

  /** @type {string | undefined} */
  let outData;
  /** @type {string | undefined} */
  let errData;

  return new Promise((resolve) => {
    child.stdout?.on('data', (data) => {
      const out = data.toString();

      outData = (outData ?? '') + out;
      process.stdout.write(data);
    });

    child.stderr?.on('data', (data) => {
      const err = data.toString();

      errData = (errData ?? '') + err;
      process.stderr.write(data);
    });

    child.on('exit', (code) => {
      resolve({ outData, errData, code: code ?? undefined });
    });
  });
}

module.exports = { execute };
