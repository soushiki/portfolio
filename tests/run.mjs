import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(here, '.pw-browsers');

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['playwright', ...process.argv.slice(2)], {
  cwd: here,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});
child.on('exit', (code) => process.exit(code ?? 1));
