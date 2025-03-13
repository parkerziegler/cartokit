import { exec } from 'node:child_process';

function runCommand(command, times) {
  if (times <= 0) return;
  console.log(`Executing benchmarks ==> Trial: ${10 - times + 1}`);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
    runCommand(command, times - 1);
  });
}

const command = 'pnpm exec playwright test';
const times = 10;

runCommand(command, times);
