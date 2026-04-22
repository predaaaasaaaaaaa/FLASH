import { ASTParser } from '../src/parser';
import { SandboxManager } from '../src/sandbox';

describe('SandboxManager (AST Sandbox Validation)', () => {
  it('should validate structurally sound code fixes', () => {
    const parser = new ASTParser();
    const sandbox = new SandboxManager(parser);

    // Provide a valid piece of TS code
    const fix = 'export function calculateSum(a: number, b: number) { return a + b; }';
    
    // Sandbox it as a `.ts` file
    const isValid = sandbox.validateFix('math.ts', fix);
    expect(isValid).toBe(true);
  });

  it('should reject code fixes with syntax errors', () => {
    const parser = new ASTParser();
    const sandbox = new SandboxManager(parser);

    // Provide a broken piece of TS code
    const fix = 'export function calculateSum(a: number b: number) return a + b }'; // Missing comma and opening brace
    
    const isValid = sandbox.validateFix('math.ts', fix);
    expect(isValid).toBe(false);
  });
});