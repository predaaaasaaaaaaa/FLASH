import { RuleEngine, FlashRules } from '../src/rules';
import { DependencyGraph } from '../src/graph';
import { ProjectIndexer } from '../src/indexer';

describe('RuleEngine (Architectural Fitness Functions)', () => {
  it('should detect when an architectural boundary is violated', () => {
    const rules: FlashRules = {
      boundaries: [
        {
          from: 'src/ui/*',
          disallow: ['src/db/*']
        }
      ]
    };

    const indexer = new ProjectIndexer();
    indexer.indexFile('src/db/connection.ts', 'export class Database {}');
    
    // UI file importing from DB
    const uiCode = `
      import { Database } from '../db/connection';
      export class Button {}
    `;
    indexer.indexFile('src/ui/button.ts', uiCode);

    const engine = new RuleEngine(indexer.graph, rules);
    const violations = engine.verify();

    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('src/ui/button.ts');
    expect(violations[0]).toContain('src/db/connection');
  });

  it('should pass when boundaries are respected', () => {
    const rules: FlashRules = {
      boundaries: [
        {
          from: 'src/ui/*',
          disallow: ['src/db/*']
        }
      ]
    };

    const indexer = new ProjectIndexer();
    indexer.indexFile('src/api/service.ts', 'import { Database } from "../db/connection";');
    indexer.indexFile('src/ui/button.ts', 'import { Service } from "../api/service";');

    const engine = new RuleEngine(indexer.graph, rules);
    const violations = engine.verify();

    expect(violations).toHaveLength(0);
  });
});