import { spawnSync } from 'child_process';
import { ChronologicalEngine } from './chronicle';
import pc from 'picocolors';

export function runInterceptor(commandArgs: string[]) {
  if (commandArgs.length === 0) {
    console.error(pc.red('Error: No command provided to run.'));
    process.exit(1);
  }

  const commandString = commandArgs.join(' ');
  const engine = new ChronologicalEngine();

  console.log(pc.dim(`⚡ FLASH Interceptor running: ${commandString}\\n`));

  let exitCode = 0;
  let output = '';

  try {
    // Run the command synchronously, pipe stdio to the terminal so the user sees it,
    // but we can't easily capture output AND pipe with spawnSync without using custom streams.
    // To capture stderr for the agent, we'll pipe stderr to a string but also write it to process.stderr.
    const child = spawnSync(commandArgs[0], commandArgs.slice(1), { 
      stdio: ['inherit', 'inherit', 'pipe'],
      shell: true
    });

    exitCode = child.status ?? 1;
    
    if (child.stderr && child.stderr.length > 0) {
        output = child.stderr.toString('utf-8');
        process.stderr.write(output);
    } else if (child.error) {
        output = child.error.message;
        console.error(pc.red(output));
    }

  } catch (error: any) {
    exitCode = 1;
    output = error.message;
    console.error(pc.red(output));
  }

  // Log to FLASH memory if it failed
  if (exitCode !== 0) {
    console.log(pc.red(`\\n⚠️ Command failed with exit code ${exitCode}. FLASH has memorized this failure.`));
    engine.logTerminalCommand(commandString, exitCode, output.trim() || 'Unknown failure or non-zero exit code with no stderr output.');
  } else {
    // We could log successful commands too, but for context efficiency we focus on errors.
    engine.logTerminalCommand(commandString, 0, 'Success');
  }

  process.exit(exitCode);
}