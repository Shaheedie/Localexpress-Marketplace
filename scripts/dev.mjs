import { spawn } from 'child_process';

const isWindows = process.platform === 'win32';

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

const backend = run('backend', 'npm', ['run', 'dev', '--prefix', 'backend']);
const frontend = run('frontend', 'npm', ['run', 'dev', '--prefix', 'frontend']);

function stopAll() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
