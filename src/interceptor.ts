import { spawn } from 'child_process';
import { ChronologicalEngine } from './chronicle';
import pc from 'picocolors';

export async function runInterceptor(commandArgs: string[]) {
  if (commandArgs.length === 0) {
    console.error(pc.red('Error: No command provided to run.'));
    process.exit(1);
  }

  const commandString = commandArgs.join(' ');
  const engine = new ChronologicalEngine();

  console.log(pc.dim(`⚡ FLASH Interceptor running: ${commandString}\\n`));

  let capturedOutput = '';

  // SECURE: shell: false prevents arbitrary command injection.
  const child = spawn(commandArgs[0], commandArgs.slice(1), { 
    shell: false 
  });

  child.stdout.on('data', (data) => {
    const chunk = data.toString('utf-8');
    capturedOutput += chunk;
    process.stdout.write(chunk); // Stream live to user
  });

  child.stderr.on('data', (data) => {
    const chunk = data.toString('utf-8');
    capturedOutput += chunk;
    process.stderr.write(chunk); // Stream live to user
  });

  child.on('error', (error) => {
    capturedOutput += error.message;
    console.error(pc.red(error.message));
  });

  child.on('close', (code) => {
    const exitCode = code ?? 1;

    // Log to FLASH memory if it failed
    if (exitCode !== 0) {
      console.log(pc.red(`\\n⚠️ Command failed with exit code ${exitCode}. FLASH has memorized this failure.`));
      engine.logTerminalCommand(commandString, exitCode, capturedOutput.trim() || 'Unknown failure or non-zero exit code.');
    } else {
      engine.logTerminalCommand(commandString, 0, 'Success');
    }

    process.exit(exitCode);
  });
}