import { ASTParser } from "./parser";
import { ProjectIndexer } from './indexer';
import { ChronologicalEngine } from './chronicle';
import { VectorDatabase } from './vector';
import { OrchestratorAgent } from './orchestrator';
import { WorkspaceScanner } from './scanner';
import { runWizard } from './wizard';
import { runUpdate } from './updater';
import { runInterceptor } from './interceptor';
import { runGitSync } from './git-sync';
import { runVerify } from './verify';
import { runFix } from './fix';
import { ConfigManager } from './config';
import pc from 'picocolors';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'wizard') {
    await runWizard();
    process.exit(0);
  }

  if (args[0] === 'update') {
    await runUpdate();
    process.exit(0);
  }

  if (args[0] === 'verify') {
    runVerify();
    return;
  }

  if (args[0] === 'fix') {
    await runFix();
    return;
  }

  if (args[0] === 'run') {
    runInterceptor(args.slice(1));
    return; // Interceptor will process.exit
  }

  if (args[0] === 'sync-git') {
    runGitSync();
    process.exit(0);
  }

  if (args[0] === '--help') {
    console.log(pc.red(`
FLASH: The Semantic Time Machine
Usage: flash <query>
       flash wizard
       flash update
       flash sync-git
       flash verify
       flash fix
       flash run <command>

Examples:
  flash run npm test
  flash "why did the build fail"
  flash fix
    `));
    process.exit(0);
  }

  const query = args.join(' ');

  const indexer = new ProjectIndexer();
  const chronicle = new ChronologicalEngine();
  const vector = new VectorDatabase();
  const configManager = new ConfigManager();
  
  console.log(pc.red('⚡ Scanning workspace and building Deterministic Graph...'));
  const scanner = new WorkspaceScanner(indexer);
  scanner.scanDirectory(process.cwd());
  
  console.log(pc.red(`   Found ${indexer.graph.getNodes().filter(n => n.type === 'file').length} files and ${indexer.graph.getNodes().filter(n => n.type === 'function').length} structures.\\n`));

  // Removing dummy history data, relying purely on the real filesystem-backed Chronological Engine
  // Dummy vector data kept for prototype fallback until Neural Search is built
  await vector.addDocument('auth.ts', 'function loginUser() {}');

  const agent = new OrchestratorAgent(indexer.graph, chronicle, vector, configManager);
  
  console.log(pc.red(`🧠 Querying FLASH Reasoning Engine:\\n`));
  const response = await agent.handleQuery(query);
  console.log(pc.red(response));
  console.log('\\n');
}

main().catch(err => {
  console.error(pc.red('Fatal Error:'), err);
  process.exit(1);
});