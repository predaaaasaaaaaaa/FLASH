import { ASTParser } from '../src/parser';

describe('ASTParser', () => {
  let parser: ASTParser;

  beforeEach(() => {
    parser = new ASTParser();
  });

  it('should parse simple function declarations', () => {
    const code = `
      function helloWorld() {
        console.log("Hello");
      }
    `;
    const names = parser.extractFunctionNames(code);
    expect(names).toContain('helloWorld');
  });

  it('should parse method definitions in classes', () => {
    const code = `
      class Greeter {
        greet() {
          return "Hello";
        }
      }
    `;
    const names = parser.extractFunctionNames(code);
    expect(names).toContain('greet');
  });

  it('should parse arrow functions assigned to const', () => {
    const code = `
      export const myArrowFunc = () => { return true; };
    `;
    const names = parser.extractFunctionNames(code);
    expect(names).toContain('myArrowFunc');
  });
});