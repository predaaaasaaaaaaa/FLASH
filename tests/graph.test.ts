import { ProjectIndexer } from '../src/indexer';

describe('ProjectIndexer & DependencyGraph', () => {
  it('should correctly index a file and extract contained functions to the graph', () => {
    const indexer = new ProjectIndexer();
    const filePath = 'example.ts';
    const code = `
      function helloGraph() { return true; }
      export const anotherFunc = () => false;
    `;

    indexer.indexFile(filePath, code);

    // Verify Graph Nodes
    const nodes = indexer.graph.getNodes();
    expect(nodes).toHaveLength(3); // 1 file + 2 functions
    
    const fileNode = nodes.find(n => n.type === 'file');
    expect(fileNode?.name).toBe('example.ts');

    const funcNodes = nodes.filter(n => n.type === 'function');
    expect(funcNodes.map(n => n.name)).toContain('helloGraph');
    expect(funcNodes.map(n => n.name)).toContain('anotherFunc');

    // Verify Graph Edges (Query Layer)
    const contained = indexer.graph.getNodesContainedIn(filePath);
    expect(contained).toHaveLength(2);
    expect(contained.map(n => n.name)).toContain('helloGraph');
    expect(contained.map(n => n.name)).toContain('anotherFunc');
  });
});