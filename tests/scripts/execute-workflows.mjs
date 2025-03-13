import { spawn } from 'node:child_process';

function runCommand(command, times) {
  if (times <= 0) {
    return;
  }
  console.log(`Executing benchmarks ==> Trial: ${10 - times + 1}`);

  const playwright = spawn('pnpm', ['exec', 'playwright', 'test']);

  playwright.stdout.on('data', (data) => {
    console.log(data.toString().replaceAll('\n', ''));
  });

  playwright.stderr.on('data', (data) => {
    console.error(data.toString().replaceAll('\n', ''));
  });

  playwright.on('close', (code) => {
    console.log(`Child process exited with code ${code}.`);
    runCommand(command, times - 1);
  });
}

const command = 'pnpm exec playwright test';
const times = 10;

runCommand(command, times);
