import { ProjectIndexer } from './indexer';
import { ChronologicalEngine } from './chronicle';
import { VectorDatabase } from './vector';
import { OrchestratorAgent } from './orchestrator';
import { WorkspaceScanner } from './scanner';
import { runWizard } from './wizard';
import { runUpdate } from './updater';
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

  if (args[0] === '--help') {
    console.log(pc.red(`
FLASH: The Semantic Time Machine
Usage: flash <query>
       flash wizard
       flash update

Examples:
  flash "why did the build fail"
  flash "where is the ASTParser defined"
  flash "how do I authenticate"
    `));
    process.exit(0);
  }

  const query = args.join(' ');

  const indexer = new ProjectIndexer();
  const chronicle = new ChronologicalEngine();
  const vector = new VectorDatabase();
  
  console.log(pc.red('⚡ Scanning workspace and building Deterministic Graph...'));
  const scanner = new WorkspaceScanner(indexer);
  scanner.scanDirectory(process.cwd());
  
  console.log(pc.red(`   Found ${indexer.graph.getNodes().filter(n => n.type === 'file').length} files and ${indexer.graph.getNodes().filter(n => n.type === 'function').length} structures.\n`));

  chronicle.logTerminalCommand('npm test', 1, 'Error: ASTParser not found');
  chronicle.logGitCommit('a1b2c3d', 'fix: export ASTParser', ['src/parser.ts']);
  await vector.addDocument('auth.ts', 'function loginUser() {}');

  const agent = new OrchestratorAgent(indexer.graph, chronicle, vector);
  
  console.log(pc.red(`🧠 Querying FLASH Reasoning Engine:\n`));
  const response = await agent.handleQuery(query);
  console.log(pc.red(response));
  console.log('\n');
}

main().catch(err => {
  console.error(pc.red('Fatal Error:'), err);
  process.exit(1);
});