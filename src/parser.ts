import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';

export class ASTParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
    // 'tree-sitter-typescript' exports two languages: 'typescript' and 'tsx'
    this.parser.setLanguage(TypeScript.typescript);
  }

  public parse(sourceCode: string): Parser.Tree {
    return this.parser.parse(sourceCode);
  }

  public extractFunctionNames(sourceCode: string): string[] {
    const tree = this.parse(sourceCode);
    const functionNames: string[] = [];

    const walk = (node: Parser.SyntaxNode) => {
      if (node.type === 'function_declaration' || node.type === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          functionNames.push(nameNode.text);
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