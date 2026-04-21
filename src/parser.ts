import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';

export class ASTParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(TypeScript.typescript);
  }

  public parse(sourceCode: string): Parser.Tree {
    return this.parser.parse(sourceCode);
  }

  public extractFunctionNames(sourceCode: string): string[] {
    const tree = this.parse(sourceCode);
    const functionNames: string[] = [];

    const walk = (node: Parser.SyntaxNode) => {
      // Standard functions and methods
      if (node.type === 'function_declaration' || node.type === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          functionNames.push(nameNode.text);
        }
      }
      
      // Arrow functions or anonymous functions assigned to variables
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
}