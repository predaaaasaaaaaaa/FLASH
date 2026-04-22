import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import Go from 'tree-sitter-go';
import Rust from 'tree-sitter-rust';
import Java from 'tree-sitter-java';

export class ASTParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript.typescript);
  }

  public setLanguageByExtension(ext: string) {
    switch (ext.toLowerCase()) {
      case '.ts':
      case '.js':
        this.parser.setLanguage(TypeScript.typescript);
        break;
      case '.tsx':
      case '.jsx':
        this.parser.setLanguage(TypeScript.tsx);
        break;
      case '.py':
        this.parser.setLanguage(Python);
        break;
      case '.go':
        this.parser.setLanguage(Go);
        break;
      case '.rs':
        this.parser.setLanguage(Rust);
        break;
      case '.java':
        this.parser.setLanguage(Java);
        break;
      default:
        this.parser.setLanguage(TypeScript.typescript);
        break;
    }
  }

  public parse(sourceCode: string): Parser.Tree {
    return this.parser.parse(sourceCode);
  }

  public extractFunctionNames(sourceCode: string): string[] {
    const tree = this.parse(sourceCode);
    const functionNames: string[] = [];

    const walk = (node: Parser.SyntaxNode) => {
      // Broad mapping of types across TS, Python, Go, Rust, Java
      const validTypes = [
        'function_declaration', 'method_definition', 'class_declaration', // TS/JS/Java
        'function_definition', 'class_definition', // Python
        'method_declaration', 'type_spec', // Go
        'function_item', 'struct_item', 'impl_item' // Rust
      ];

      if (validTypes.includes(node.type)) {
        // Try the explicit field 'name' first, otherwise fallback to the first identifier
        const nameNode = node.childForFieldName('name') || this.findNameNode(node);
        if (nameNode) {
          functionNames.push(nameNode.text);
        }
      }
      
      // Arrow functions or anonymous functions assigned to variables (TS/JS)
      if (node.type === 'variable_declarator') {
        const valueNode = node.childForFieldName('value');
        if (valueNode && (valueNode.type === 'arrow_function' || valueNode.type === 'function')) {
          const nameNode = node.childForFieldName('name');
          if (nameNode) {
            functionNames.push(nameNode.text);
          }
        }
      }

      for (const child of node.children) {
        walk(child);
      }
    };

    walk(tree.rootNode);
    return functionNames;
  }

  private findNameNode(node: Parser.SyntaxNode): Parser.SyntaxNode | null {
    for (const child of node.children) {
      if (child.type === 'identifier' || child.type === 'type_identifier') {
        return child;
      }
    }
    return null;
  }
}