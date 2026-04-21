import { execSync } from 'child_process';
import { ChronologicalEngine } from './chronicle';
import pc from 'picocolors';

export function runGitSync() {
  console.log(pc.dim('⚡ FLASH syncing recent Git history...\\n'));
  
  try {
    // Get the last 10 commits: hash, timestamp, subject
    const logOutput = execSync('git log -n 10 --pretty=format:"%H|%ct|%s"', { encoding: 'utf-8' });
    if (!logOutput.trim()) {
      console.log(pc.dim('No git commits found.'));
      return;
    }

    const engine = new ChronologicalEngine();
    const existingEvents = engine.getEvents().filter(e => e.type === 'git_commit').map(e => e.id);

    const commits = logOutput.trim().split('\\n');
    let addedCount = 0;

    for (const commitLine of commits.reverse()) { // Process oldest to newest of the 10
      const [hash, timestampStr, message] = commitLine.split('|');
      
      // Skip if already in memory
      if (existingEvents.includes(hash)) {
        continue;
      }

      // Get files changed in this commit
      const filesOutput = execSync(`git diff-tree --no-commit-id --name-only -r ${hash}`, { encoding: 'utf-8' });
      const filesChanged = filesOutput.trim().split('\\n').filter(Boolean);

      engine.logGitCommit(hash, message, filesChanged);
      addedCount++;
    }

    if (addedCount > 0) {
      console.log(pc.green(`Successfully synced ${addedCount} new git commits into FLASH memory.`));
    } else {
      console.log(pc.dim('Git history is already fully synced.'));
    }

  } catch (error: any) {
    console.error(pc.red(`Failed to sync git history: ${error.message}`));
  }
}