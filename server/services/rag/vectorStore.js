import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getEmbedding } from './embeddingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vectorStorageDir = path.join(__dirname, '../../data/vectors');

if (!fs.existsSync(vectorStorageDir)) {
  fs.mkdirSync(vectorStorageDir, { recursive: true });
}

function getVectorFilePath(documentId) {
  return path.join(vectorStorageDir, `${documentId}.json`);
}

/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
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

export const vectorStore = {
  /**
   * Saves chunks and their embeddings for a document
   * @param {string} documentId
   * @param {Array<{ id: string, pageContent: string, metadata: object }>} chunks
   * @param {Array<number[]>} embeddings
   */
  async saveDocumentVectors(documentId, chunks, embeddings) {
    const vectorData = chunks.map((chunk, index) => ({
      id: chunk.id,
      pageContent: chunk.pageContent,
      metadata: chunk.metadata,
      embedding: embeddings[index]
    }));

    const filePath = getVectorFilePath(documentId);
    await fs.promises.writeFile(filePath, JSON.stringify(vectorData, null, 2), 'utf-8');
    console.log(`[VectorStore] Saved ${vectorData.length} vector chunks for document ${documentId}`);
  },

  /**
   * Loads stored vector chunks for a document
   */
  async getDocumentVectors(documentId) {
    const filePath = getVectorFilePath(documentId);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  },

  /**
   * Performs semantic similarity search on a document's vector store
   * @param {string} documentId
   * @param {string} query
   * @param {number} k - Number of top chunks to return
   * @returns {Promise<Array<{ chunk: object, score: number }>>}
   */
  async similaritySearch(documentId, query, k = 4) {
    const vectorData = await this.getDocumentVectors(documentId);
    if (!vectorData || vectorData.length === 0) {
      return [];
    }

    const queryEmbedding = await getEmbedding(query);

    const scored = vectorData.map(item => {
      const score = cosineSimilarity(queryEmbedding, item.embedding);
      return {
        id: item.id,
        pageContent: item.pageContent,
        metadata: item.metadata,
        score: Math.max(0, Math.min(1, score))
      };
    });

    // Sort descending by similarity score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, k);
  },

  /**
   * Performs similarity search across multiple documents
   */
  async similaritySearchMultiple(documentIds, query, k = 6) {
    const allResults = [];
    const queryEmbedding = await getEmbedding(query);

    for (const docId of documentIds) {
      const vectorData = await this.getDocumentVectors(docId);
      for (const item of vectorData) {
        const score = cosineSimilarity(queryEmbedding, item.embedding);
        allResults.push({
          id: item.id,
          pageContent: item.pageContent,
          metadata: item.metadata,
          score: Math.max(0, Math.min(1, score))
        });
      }
    }

    allResults.sort((a, b) => b.score - a.score);
    return allResults.slice(0, k);
  },

  /**
   * Deletes stored vector file for a document
   */
  async deleteDocumentVectors(documentId) {
    const filePath = getVectorFilePath(documentId);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`[VectorStore] Deleted vectors for document ${documentId}`);
    }
  }
};
