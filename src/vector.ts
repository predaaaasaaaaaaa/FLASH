export interface VectorDoc {
  id: string;
  content: string;
  embedding: number[];
}

export class VectorDatabase {
  private docs: VectorDoc[] = [];
  // A tiny predefined vocabulary for our deterministic test embeddings
  private vocab = ['function', 'login', 'password', 'user', 'math', 'add', 'number', 'authenticate', 'error', 'system'];

  async addDocument(id: string, content: string) {
    const embedding = await this.generateEmbedding(content);
    this.docs.push({ id, content, embedding });
  }

  // Deterministic Mock: Term-Frequency based embedding strictly for reliable testing.
  async generateEmbedding(text: string): Promise<number[]> {
    const normalizedText = text.toLowerCase();
    const vector = new Array(this.vocab.length).fill(0);
    
    this.vocab.forEach((word, index) => {
      // Basic count of word occurrences
      const regex = new RegExp(word, 'g');
      const matches = normalizedText.match(regex);
      if (matches) {
        vector[index] = matches.length;
      }
    });

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => magnitude === 0 ? 0 : val / magnitude);
  }

  async search(query: string, topK: number = 3): Promise<VectorDoc[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    return this.docs
      .map(doc => ({ doc, similarity: this.cosineSimilarity(queryEmbedding, doc.embedding) }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.doc);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}