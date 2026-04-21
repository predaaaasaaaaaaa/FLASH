import { ASTParser } from './parser';
import { DependencyGraph } from './graph';

export class ProjectIndexer {
  private parser = new ASTParser();
  public graph = new DependencyGraph();

  public indexFile(filePath: string, content: string) {
    // Register the file itself
    this.graph.addNode({ id: filePath, type: 'file', name: filePath });
    
    // Extract functions and link them as 'contained' in the file
    const functions = this.parser.extractFunctionNames(content);
    for (const funcName of functions) {
       const funcId = `${filePath}:${funcName}`;
       this.graph.addNode({ id: funcId, type: 'function', name: funcName });
       this.graph.addEdge({ sourceId: filePath, targetId: funcId, type: 'contains' });
    }
  }
}