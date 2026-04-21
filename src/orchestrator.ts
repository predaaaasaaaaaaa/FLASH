import { DependencyGraph } from './graph';
import { ChronologicalEngine } from './chronicle';
import { VectorDatabase } from './vector';

export class OrchestratorAgent {
  constructor(
    private graph: DependencyGraph,
    private chronicle: ChronologicalEngine,
    private vectorDB: VectorDatabase
  ) {}

  async handleQuery(query: string): Promise<string> {
    const normalized = query.toLowerCase();

    // 1. Time-Series Reasoning (The "Why")
    if (normalized.includes('why') || normalized.includes('error') || normalized.includes('fail')) {
      const failures = this.chronicle.getFailedCommands();
      if (failures.length > 0) {
        const lastFail = failures[failures.length - 1];
        const fix = this.chronicle.correlateFixToFailure(lastFail.id);
        if (fix) {
           return `Based on terminal history, you encountered error '${lastFail.payload.output}' and fixed it in commit '${fix.payload.hash}'.`;
        }
        return `You encountered error '${lastFail.payload.output}' but no fix has been correlated yet.`;
      }
      return "I have no historical context for this error.";
    }

    // 2. Deterministic Graph Reasoning (The "Structure")
    if (normalized.includes('where') || normalized.includes('call') || normalized.includes('contain') || normalized.includes('define')) {
       // Mock intent extraction mapping to graph query
       const fileNodes = this.graph.getNodes().filter(n => n.type === 'file');
       if (fileNodes.length > 0) {
           const targetFile = fileNodes[0].id;
           const functions = this.graph.getNodesContainedIn(targetFile);
           if (functions.length > 0) {
               return `File '${targetFile}' structurally contains functions: ${functions.map(f => f.name).join(', ')}.`;
           }
       }
       return "I could not find structural mappings in the Dependency Graph.";
    }

    // 3. Semantic Fallback (The "General")
    const docs = await this.vectorDB.search(query, 1);
    if (docs.length > 0) {
      return `Semantically relevant context found in '${docs[0].id}'.`;
    }

    return "I don't have enough deterministic context to answer this query without hallucinating.";
  }
}