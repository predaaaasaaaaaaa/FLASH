import { ASTParser } from './parser';
import * as path from 'path';

export class SandboxManager {
  constructor(private parser: ASTParser) {}

  public validateFix(filePath: string, proposedFix: string): boolean {
    const ext = path.extname(filePath);
    
    // Ensure the parser is using the correct grammar
    this.parser.setLanguageByExtension(ext);
    
    try {
      const tree = this.parser.parse(proposedFix);
      
      // Check if the parsed tree has any syntax errors
      const hasError = this.checkForErrorNode(tree.rootNode);
      return !hasError;
    } catch (e) {
      // If the parser crashes completely, the fix is definitely invalid
      return false;
    }
  }

  private checkForErrorNode(node: any): boolean {
    if (node.type === 'ERROR' || node.isMissing) {
      return true;
    }
    
    for (const child of node.children) {
      if (this.checkForErrorNode(child)) {
        return true;
      }
    }
    
    return false;
  }
}