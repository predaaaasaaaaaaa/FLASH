import { VectorDatabase } from '../src/vector';

describe('VectorDatabase', () => {
  it('should store and semantically retrieve documents using cosine similarity', async () => {
    const db = new VectorDatabase();
    
    await db.addDocument('auth.ts', 'function loginUser(password: string) { ... }');
    await db.addDocument('math.ts', 'function addNumbers(a: number, b: number) { ... }');
    
    // "authenticate" is closer to the loginUser string character distribution
    // in our deterministic test embedding than math operations
    const resultsAuth = await db.search('authenticate password login', 1);
    
    expect(resultsAuth).toHaveLength(1);
    expect(resultsAuth[0].id).toBe('auth.ts');
  });

  it('should handle empty queries safely', async () => {
    const db = new VectorDatabase();
    await db.addDocument('doc1', 'data');
    
    const results = await db.search('', 1);
    // Since the embedding of empty string might be zeros, similarity might be 0, but it shouldn't crash
    expect(results).toBeDefined();
  });

  it('should successfully retrieve based on conceptual semantic meaning, not just exact term matching', async () => {
    const db = new VectorDatabase();
    
    await db.addDocument('auth.ts', 'function registerNewAccount(secretToken: string) { ... }');
    await db.addDocument('math.ts', 'function calculateSum(valueX: number, valueY: number) { ... }');
    
    // "signing in securely" conceptually means authentication.
    // However, we include the word "number" to bait the deterministic term-frequency mock
    // into selecting math.ts instead of auth.ts.
    const resultsAuth = await db.search('signing in securely with a phone number', 1);
    
    expect(resultsAuth).toHaveLength(1);
    expect(resultsAuth[0].id).toBe('auth.ts'); // Should fail under term-frequency mock because "number" hits math.ts
  });
});