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
       // Extract the likely target symbol from the query (rudimentary heuristic)
       const words = query.split(' ');
       let targetSymbol = '';
       // E.g., "where is ASTParser defined" -> finds ASTParser by looking for capitalized/camelCase words
       for (const word of words) {
           if (word.length > 2 && word.match(/^[A-Z][a-zA-Z]+$|^[a-z]+[A-Z][a-zA-Z]+$/)) {
               targetSymbol = word;
               break;
           }
       }
       if (!targetSymbol && words.length > 2) {
           // Fallback: take the word before "defined"
           const defineIdx = words.findIndex(w => w.toLowerCase().includes('define'));
           if (defineIdx > 0) targetSymbol = words[defineIdx - 1];
       }

       if (targetSymbol) {
           // Deterministically find the node in the Graph
           const funcNodes = this.graph.getNodes().filter(n => n.type === 'function' && n.name === targetSymbol);
           if (funcNodes.length > 0) {
               // Find which file contains it via Graph Edges
               const edges = this.graph.getEdges().filter(e => e.targetId === funcNodes[0].id && e.type === 'contains');
               if (edges.length > 0) {
                   const fileNode = this.graph.getNodes().find(n => n.id === edges[0].sourceId);
                   return `[Graph Reasoning] Structurally verified: '${targetSymbol}' is defined in '${fileNode?.name}'.`;
               }
           }
       }
       
       return "I could not find structural mappings in the Dependency Graph for your specific symbol.";
    }

    // 3. Semantic Fallback (The "General")
    const docs = await this.vectorDB.search(query, 1);
    if (docs.length > 0) {
      return `Semantically relevant context found in '${docs[0].id}'.`;
    }

    return "I don't have enough deterministic context to answer this query without hallucinating.";
  }
}