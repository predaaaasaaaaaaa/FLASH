export interface GraphNode {
  id: string; // unique identifier, e.g., 'src/parser.ts:ASTParser'
  type: 'file' | 'class' | 'function' | 'variable';
  name: string;
  content?: string; // Optional precise structural bounds for Graph-RAG
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  type: 'contains' | 'calls' | 'imports';
}

export class DependencyGraph {
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];

  addNode(node: GraphNode) {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, node);
    }
  }

  addEdge(edge: GraphEdge) {
    this.edges.push(edge);
  }

  getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  getEdges(): GraphEdge[] {
    return this.edges;
  }

  // Example Query Layer Function
  getNodesContainedIn(fileId: string): GraphNode[] {
    const containedIds = this.edges
      .filter(e => e.sourceId === fileId && e.type === 'contains')
      .map(e => e.targetId);
    
    return containedIds.map(id => this.nodes.get(id)!).filter(Boolean);
  }
}