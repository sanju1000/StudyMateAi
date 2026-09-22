import Document from '../../models/Document.js';
import { extractDocumentText } from '../rag/textExtractor.js';
import { splitDocumentIntoChunks } from '../rag/textSplitter.js';
import { getEmbeddingsBatch } from '../rag/embeddingService.js';
import { vectorStore } from '../rag/vectorStore.js';
import fs from 'fs';

export const processDocumentAsync = async (documentId) => {
  try {
    console.log(`[DocumentService] Starting processing for document: ${documentId}`);
    const doc = await Document.findById(documentId);
    if (!doc) {
      console.error(`Document not found: ${documentId}`);
      return;
    }

    doc.status = 'processing';
    await doc.save();

    // 1. Extract text and pages
    const { fullText, pageCount, pages } = await extractDocumentText(doc.filePath, doc.fileType);

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No readable text could be extracted from this document.');
    }

    // 2. Split into chunks
    const chunks = await splitDocumentIntoChunks(pages, doc._id, doc.originalName);
    console.log(`[DocumentService] Extracted ${chunks.length} chunks from ${pageCount} pages`);

    // 3. Generate embeddings
    const chunkTexts = chunks.map(c => c.pageContent);
    const embeddings = await getEmbeddingsBatch(chunkTexts);

    // 4. Save vectors
    await vectorStore.saveDocumentVectors(doc._id.toString(), chunks, embeddings);

    // 5. Update document status
    doc.status = 'ready';
    doc.pageCount = pageCount;
    doc.chunkCount = chunks.length;
    await doc.save();

    console.log(`[DocumentService] Document ${documentId} processed successfully and is ready.`);
  } catch (error) {
    console.error(`[DocumentService] Error processing document ${documentId}:`, error);
    try {
      await Document.findByIdAndUpdate(documentId, {
        status: 'error',
        errorMessage: error.message || 'Error processing document'
      });
    } catch (e) {
      console.error('Failed to update document error status:', e);
    }
  }
};
