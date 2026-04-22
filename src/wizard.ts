import prompts from 'prompts';
import pc from 'picocolors';
import ora from 'ora';
import { ProjectIndexer } from './indexer';
import { ChronologicalEngine } from './chronicle';
import { VectorDatabase } from './vector';
import { OrchestratorAgent } from './orchestrator';
import { WorkspaceScanner } from './scanner';
import { ConfigManager } from './config';

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
  
  console.log(pc.red('  The Semantic Time Machine for 2026\\n'));
  
  const configManager = new ConfigManager();
  let config = configManager.getConfig();

  if (!config) {
    console.log(pc.yellow("  ⚠️ No AI Provider configured. Let's set up your LLM!"));
    const setupProvider = await prompts([
      {
        type: 'select',
        name: 'provider',
        message: pc.red('Choose your AI Provider'),
        choices: [
          { title: 'Google Gemini', value: 'gemini' },
          { title: 'OpenAI', value: 'openai' },
          { title: 'Ollama (Local Models)', value: 'ollama' }
        ]
      }
    ]);
    
    if (!setupProvider.provider) {
      console.log(pc.dim('  Configuration cancelled.'));
      process.exit(0);
    }
    
    if (setupProvider.provider === 'ollama') {
      const setupOllama = await prompts([
        {
          type: 'text',
          name: 'baseUrl',
          message: pc.red('Enter Ollama Base URL'),
          initial: 'http://localhost:11434'
        },
        {
          type: 'text',
          name: 'model',
          message: pc.red('Enter Ollama Model name'),
          initial: 'llama3'
        }
      ]);
      
      if (!setupOllama.baseUrl || !setupOllama.model) {
        console.log(pc.dim('  Configuration cancelled.'));
        process.exit(0);
      }
      
      config = { provider: 'ollama', baseUrl: setupOllama.baseUrl, model: setupOllama.model };
    } else {
      const setupKey = await prompts([
        {
          type: 'password',
          name: 'apiKey',
          message: pc.red('Enter your API Key (stored safely locally)')
        }
      ]);
      
      if (!setupKey.apiKey) {
        console.log(pc.dim('  Configuration cancelled.'));
        process.exit(0);
      }
      
      config = { provider: setupProvider.provider, apiKey: setupKey.apiKey };
    }

    configManager.saveConfig(config);
    console.log(pc.green('  ✔ AI Provider configured successfully!\\n'));
  }

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
      text: pc.red(`Querying FLASH Reasoning Engine via ${config.provider.toUpperCase()}...`),
      color: 'red'
    }).start();

    // Dummy vector data kept for prototype fallback
    await vector.addDocument('auth.ts', 'function loginUser() {}');

    const agent = new OrchestratorAgent(indexer.graph, chronicle, vector, configManager);
    const result = await agent.handleQuery(response.query);
    
    agentSpinner.stop();
    console.log(pc.bold(pc.red('\\n  🧠 FLASH Response:\\n')));
    console.log(pc.red(`  > ${result}\\n`));
    
  } catch (error: any) {
    spinner.fail(pc.red(`Error: ${error.message}`));
  }
}