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
});