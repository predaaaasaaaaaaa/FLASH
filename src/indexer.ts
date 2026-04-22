import * as path from 'path';
import { ASTParser } from './parser';
import { DependencyGraph } from './graph';

export class ProjectIndexer {
  private parser = new ASTParser();
  public graph = new DependencyGraph();

  public indexFile(filePath: string, content: string) {
    // Register the file itself
    this.graph.addNode({ id: filePath, type: 'file', name: filePath });
    
    // Dynamically set the correct language grammar based on file extension
    const ext = path.extname(filePath);
    this.parser.setLanguageByExtension(ext);

    // Extract functions and link them as 'contained' in the file
    const functions = this.parser.extractFunctionNames(content);
    for (const funcName of functions) {
       const funcId = `${filePath}:${funcName}`;
       this.graph.addNode({ id: funcId, type: 'function', name: funcName });
       this.graph.addEdge({ sourceId: filePath, targetId: funcId, type: 'contains' });
    }

    // Extract imports and link them as 'imports' edges from the file
    const imports = this.parser.extractImports(content);
    for (const importPath of imports) {
       // Normalize paths roughly for the prototype by resolving against the file's dir
       let resolvedTarget = importPath;
       if (importPath.startsWith('.')) {
          resolvedTarget = path.join(path.dirname(filePath), importPath);
       }
       // We create an edge from the file to the resolved module path
       this.graph.addEdge({ sourceId: filePath, targetId: resolvedTarget, type: 'imports' });
    }
  }
}