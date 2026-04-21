import { ProjectIndexer } from './indexer';
import { ChronologicalEngine } from './chronicle';
import { VectorDatabase } from './vector';
import { OrchestratorAgent } from './orchestrator';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
FLASH: The Semantic Time Machine
Usage: flash <query>

Examples:
  flash "why did the build fail"
  flash "where is the ASTParser defined"
  flash "how do I authenticate"
    `);
    process.exit(0);
  }

  const query = args.join(' ');

  // Initialize Engines (In production, this would load from .flash/ storage)
  const indexer = new ProjectIndexer();
  const chronicle = new ChronologicalEngine();
  const vector = new VectorDatabase();
  
  // Seed with dummy data for the prototype
  indexer.indexFile('src/parser.ts', 'export class ASTParser {}');
  chronicle.logTerminalCommand('npm test', 1, 'Error: ASTParser not found');
  chronicle.logGitCommit('a1b2c3d', 'fix: export ASTParser', ['src/parser.ts']);
  await vector.addDocument('auth.ts', 'function loginUser() {}');

  const agent = new OrchestratorAgent(indexer.graph, chronicle, vector);
  
  console.log(`\n⚡ FLASH Reasoning Engine:\n`);
  const response = await agent.handleQuery(query);
  console.log(response);
  console.log('\n');
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});