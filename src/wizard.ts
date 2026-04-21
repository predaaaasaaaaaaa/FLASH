import prompts from 'prompts';
import pc from 'picocolors';
import ora from 'ora';
import { ProjectIndexer } from './indexer';
import { ChronologicalEngine } from './chronicle';
import { VectorDatabase } from './vector';
import { OrchestratorAgent } from './orchestrator';
import { WorkspaceScanner } from './scanner';

export async function runWizard() {
  console.clear();
  console.log(pc.red(pc.bold(`
  ███████╗██╗      █████╗ ███████╗██╗  ██╗
  ██╔════╝██║     ██╔══██╗██╔════╝██║  ██║
  █████╗  ██║     ███████║███████╗███████║
  ██╔══╝  ██║     ██╔══██║╚════██║██╔══██║
  ██║     ███████╗██║  ██║███████║██║  ██║
  ╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
  `)));
  
  console.log(pc.red('  The Semantic Time Machine for 2026\n'));
  
  const response = await prompts({
    type: 'text',
    name: 'query',
    message: pc.red('What would you like to know about this codebase?'),
    initial: 'Where is the WorkspaceScanner defined?'
  });

  if (!response.query) {
    console.log(pc.dim('  Wizard cancelled.'));
    process.exit(0);
  }

  const spinner = ora({
    text: pc.red('Scanning workspace and building Deterministic Graph...'),
    color: 'red',
    spinner: 'dots'
  }).start();

  try {
    const indexer = new ProjectIndexer();
    const chronicle = new ChronologicalEngine();
    const vector = new VectorDatabase();
    
    const scanner = new WorkspaceScanner(indexer);
    scanner.scanDirectory(process.cwd());
    
    const filesCount = indexer.graph.getNodes().filter(n => n.type === 'file').length;
    const funcsCount = indexer.graph.getNodes().filter(n => n.type === 'function').length;
    
    spinner.succeed(pc.red(`Graph built. Indexed ${pc.bold(filesCount)} files and ${pc.bold(funcsCount)} structures.`));
    
    const agentSpinner = ora({
      text: pc.red('Querying FLASH Reasoning Engine...'),
      color: 'red'
    }).start();

    // Dummy history data
    chronicle.logTerminalCommand('npm test', 1, 'Error: ASTParser not found');
    chronicle.logGitCommit('a1b2c3d', 'fix: export ASTParser', ['src/parser.ts']);
    await vector.addDocument('auth.ts', 'function loginUser() {}');

    const agent = new OrchestratorAgent(indexer.graph, chronicle, vector);
    const result = await agent.handleQuery(response.query);
    
    agentSpinner.stop();
    console.log(pc.bold(pc.red('\n  🧠 FLASH Response:\n')));
    console.log(pc.red(`  > ${result}\n`));
    
  } catch (error: any) {
    spinner.fail(pc.red(`Error: ${error.message}`));
  }
}