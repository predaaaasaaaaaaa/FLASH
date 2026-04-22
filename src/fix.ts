import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { ProjectIndexer } from './indexer';
import { ChronologicalEngine } from './chronicle';
import { WorkspaceScanner } from './scanner';
import { SandboxManager } from './sandbox';
import { ASTParser } from './parser';
import { LLMClient } from './llm';
import { ConfigManager } from './config';

export async function runFix() {
  const configManager = new ConfigManager();
  const config = configManager.getConfig();

  if (!config) {
    console.error(pc.red('Error: AI Provider not configured. Run `flash wizard` first to setup your LLM.'));
    process.exit(1);
  }

  console.log(pc.dim('⚡ FLASH Auto-Fixer initializing...\\n'));

  const indexer = new ProjectIndexer();
  const chronicle = new ChronologicalEngine();
  const parser = new ASTParser();
  const sandbox = new SandboxManager(parser);
  const llm = new LLMClient(config);

  const scanner = new WorkspaceScanner(indexer);
  scanner.scanDirectory(process.cwd());

  const failures = chronicle.getFailedCommands();
  if (failures.length === 0) {
    console.log(pc.green('No recent terminal failures found in FLASH memory. Everything looks good!'));
    process.exit(0);
  }

  const lastFailure = failures[failures.length - 1];
  console.log(pc.yellow(`Analyzing recent failure:`));
  console.log(pc.dim(`> Command: ${lastFailure.payload.command}`));
  console.log(pc.dim(`> Error: ${lastFailure.payload.output.substring(0, 150)}...\\n`));

  // Heuristic to extract the target file from the error message or command
  // A robust V2 would map stack traces to the Graph, but for our prototype we look for obvious file paths.
  let targetFile = '';
  const args = lastFailure.payload.command.split(' ');
  for (const arg of args) {
    if (arg.endsWith('.ts') || arg.endsWith('.js') || arg.endsWith('.py')) {
      targetFile = arg;
      break;
    }
  }

  if (!targetFile || !fs.existsSync(path.join(process.cwd(), targetFile))) {
    console.error(pc.red('Error: Could not confidently determine which file caused the failure to apply an auto-fix.'));
    process.exit(1);
  }

  const fileContent = fs.readFileSync(path.join(process.cwd(), targetFile), 'utf-8');

  console.log(pc.cyan(`🧠 Consulting ${config.provider.toUpperCase()} for a fix to '${targetFile}'...`));

  const prompt = `You are an expert developer. The user ran the following command which failed:
Command: ${lastFailure.payload.command}

Error Output:
${lastFailure.payload.output}

Here is the current content of the file '${targetFile}':
\`\`\`
${fileContent}
\`\`\`

Provide the COMPLETE, fixed content for this file. 
DO NOT use markdown formatting like \`\`\`typescript or \`\`\`. 
Return ONLY the raw code text so it can be parsed and saved immediately.`;

  const proposedFix = await llm.generateResponse("Fix the error.", prompt);
  const cleanFix = proposedFix.replace(/^```[a-z]*\\n/, '').replace(/\\n```$/, '');

  console.log(pc.cyan(`⚙️ Applying fix to the AST Sandbox for validation...`));

  const isValid = sandbox.validateFix(targetFile, cleanFix);

  if (isValid) {
    fs.writeFileSync(path.join(process.cwd(), targetFile), cleanFix, 'utf-8');
    console.log(pc.green(`\\n✔ Fix mathematically validated by Tree-Sitter and applied to '${targetFile}' successfully!`));
    process.exit(0);
  } else {
    console.error(pc.red(`\\n✘ FLASH Rejected the fix! The proposed code contained syntax errors and failed AST validation.`));
    process.exit(1);
  }
}