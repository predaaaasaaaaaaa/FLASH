import * as fs from 'fs';
import * as path from 'path';
import pc from 'picocolors';
import { ProjectIndexer } from './indexer';
import { WorkspaceScanner } from './scanner';
import { RuleEngine, FlashRules } from './rules';

export function runVerify() {
  const rulesPath = path.join(process.cwd(), '.flash_rules.json');
  if (!fs.existsSync(rulesPath)) {
    console.error(pc.red('Error: .flash_rules.json not found in the current directory.'));
    process.exit(1);
  }

  let rules: FlashRules;
  try {
    rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
  } catch (e: any) {
    console.error(pc.red(`Error parsing .flash_rules.json: ${e.message}`));
    process.exit(1);
  }

  console.log(pc.dim('⚡ FLASH enforcing Architectural Fitness Functions...\\n'));

  const indexer = new ProjectIndexer();
  const scanner = new WorkspaceScanner(indexer);
  scanner.scanDirectory(process.cwd());

  const engine = new RuleEngine(indexer.graph, rules);
  const violations = engine.verify();

  if (violations.length === 0) {
    console.log(pc.green('✔ Architecture verified. No boundary violations detected.'));
    process.exit(0);
  } else {
    console.error(pc.red(`\\n⚠️ Detected ${violations.length} Architectural Violations:`));
    for (const v of violations) {
      console.error(pc.red(`  - ${v}`));
    }
    console.log();
    process.exit(1);
  }
}