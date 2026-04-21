import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceScanner } from '../src/scanner';
import { ProjectIndexer } from '../src/indexer';

describe('WorkspaceScanner', () => {
  const testDir = path.join(__dirname, 'temp_test_workspace');

  beforeAll(() => {
    // Setup a mock workspace on the filesystem
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    fs.writeFileSync(path.join(testDir, 'test1.ts'), 'export function fromFileOne() {}');
    
    const subDir = path.join(testDir, 'subdir');
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(subDir, 'test2.ts'), 'export class FromFileTwo {}');
    fs.writeFileSync(path.join(subDir, 'ignore.txt'), 'this should be ignored');
  });

  afterAll(() => {
    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should recursively scan directories and index valid source files', () => {
    const indexer = new ProjectIndexer();
    const scanner = new WorkspaceScanner(indexer);

    scanner.scanDirectory(testDir);

    const nodes = indexer.graph.getNodes();
    
    // We expect 2 files and 2 functions/classes to be indexed
    const fileNodes = nodes.filter(n => n.type === 'file');
    expect(fileNodes).toHaveLength(2);
    expect(fileNodes.map(n => path.basename(n.name))).toContain('test1.ts');
    expect(fileNodes.map(n => path.basename(n.name))).toContain('test2.ts');

    const funcNodes = nodes.filter(n => n.type === 'function');
    expect(funcNodes).toHaveLength(2);
    expect(funcNodes.map(n => n.name)).toContain('fromFileOne');
    expect(funcNodes.map(n => n.name)).toContain('FromFileTwo');
  });
});