import { execSync } from 'child_process';
import pc from 'picocolors';
import ora from 'ora';

export async function runUpdate() {
  console.clear();
  console.log(pc.red(pc.bold(`
  ███████╗██╗      █████╗ ███████╗██╗  ██╗
  ██╔════╝██║     ██╔══██╗██╔════╝██║  ██║
  █████╗  ██║     ███████║███████╗███████║
  ██╔══╝  ██║     ██╔══██║╚════██║██╔══██║
  ██║     ███████╗██║  ██║███████║██║  ██║
  ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
  `)));

  const spinner = ora({
    text: pc.red('Checking for FLASH updates...'),
    color: 'red',
    spinner: 'dots'
  }).start();

  try {
    // In a real published npm package, this would run:
    // execSync('npm install -g flash-memory@latest', { stdio: 'ignore' });
    
    // For our prototype/git-based version, we pull the latest master branch
    execSync('git pull origin master', { stdio: 'ignore' });
    execSync('npm run build', { stdio: 'ignore' });

    spinner.succeed(pc.bold(pc.red('FLASH successfully updated to the latest version! ⚡')));
    console.log(pc.dim('\\n  Run `flash wizard` to start exploring.\\n'));
  } catch (error: any) {
    spinner.fail(pc.red('Update failed. Are you in the correct directory or connected to the internet?'));
    console.error(pc.dim(error.message));
    process.exit(1);
  }
}