const spawn = require('child_process').spawn;
const os = require('os');
const path = require('path');
const fs = require('fs');

const RED_COLOR = '\x1b[31m';
const GREEN_COLOR = '\x1b[32m';
const YELLOW_COLOR = '\x1b[33m';
const RESET_COLOR = '\x1b[0m';

async function spawnAsync(command, ...args) {
  let options = {};
  if (args.length && args[args.length - 1].constructor.name !== 'String')
    options = args.pop();
  const cmd = spawn(command, args, options);
  let stdout = '';
  let stderr = '';
  cmd.stdout.on('data', data => stdout += data);
  cmd.stderr.on('data', data => stderr += data);
  const code = await new Promise(x => cmd.once('close', x));
  /*
  console.log(command, ...args);
  console.log('------ stdout --------');
  console.log(stdout);
  console.log('------ stderr --------');
  console.log(stderr);
  */
  return {code, stdout, stderr};
}

async function spawnAsyncOrDie(command, ...args) {
  const {code, stdout, stderr} = await spawnAsync(command, ...args);
  if (code !== 0)
    throw new Error(`Failed to executed: "${command} ${args.join(' ')}".\n\n=== STDOUT ===\n${stdout}\n\n\n=== STDERR ===\n${stderr}`);
  return {stdout, stderr};
}

const TMP_FOLDER = path.join(os.tmpdir(), 'tmp_folder-');

async function clonePlaywrightRepo() {
  const checkoutPath = await fs.promises.mkdtemp(TMP_FOLDER);
  await spawnAsyncOrDie('git', 'clone', '--single-branch', '--branch', `master`, '--depth=1', 'https://github.com/microsoft/playwright.git', checkoutPath);
  return checkoutPath;
}

module.exports = { spawnAsync, spawnAsyncOrDie, clonePlaywrightRepo };
