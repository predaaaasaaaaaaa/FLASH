import { OrchestratorAgent } from '../src/orchestrator';
import { DependencyGraph } from '../src/graph';
import { ChronologicalEngine } from '../src/chronicle';
import { VectorDatabase } from '../src/vector';
import { ProjectIndexer } from '../src/indexer';

describe('OrchestratorAgent', () => {
  let agent: OrchestratorAgent;
  let graph: DependencyGraph;
  let chronicle: ChronologicalEngine;
  let vector: VectorDatabase;

  beforeEach(() => {
    const indexer = new ProjectIndexer();
    indexer.indexFile('example.ts', 'function testFunc() {}');
    graph = indexer.graph;
    
    chronicle = new ChronologicalEngine();
    vector = new VectorDatabase();
    agent = new OrchestratorAgent(graph, chronicle, vector);
  });

  it('should route "why/error" queries to the Chronological Engine', async () => {
    chronicle.logTerminalCommand('npm build', 1, 'Build crash 0x1A');
    
    // Simulate time passing before commit
    await new Promise(resolve => setTimeout(resolve, 10));
    
    chronicle.logGitCommit('c1', 'fix build', ['example.ts']);
    
    const response = await agent.handleQuery('why did the build fail');
    expect(response).toContain("Build crash 0x1A");
    expect(response).toContain("c1");
  });

  it('should route "where/define" queries to the Deterministic Graph', async () => {
    const response = await agent.handleQuery('where is testFunc defined');
    expect(response).toContain("example.ts");
    expect(response).toContain("testFunc");
  });

  it('should fallback to the Vector DB for general queries', async () => {
    await vector.addDocument('auth.ts', 'function login() {}');
    const response = await agent.handleQuery('how do I authenticate user login');
    expect(response).toContain('auth.ts');
  });

  it('should strictly refuse to guess if context is missing', async () => {
    // A completely blank query that doesn't trigger history or structure
    const emptyVector = new VectorDatabase();
    const emptyAgent = new OrchestratorAgent(graph, chronicle, emptyVector);
    const response = await emptyAgent.handleQuery('random thought about code');
    
    expect(response).toContain("hallucinating");
  });
});