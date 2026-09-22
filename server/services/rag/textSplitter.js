import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

/**
 * Splits document text into chunks with rich metadata
 * @param {Array<{ pageNumber: number, text: string }>} pages
 * @param {string} documentId
 * @param {string} fileName
 * @returns {Promise<Array<{ pageContent: string, metadata: object }>>}
 */
export async function splitDocumentIntoChunks(pages, documentId, fileName) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
    separators: ['\n\n', '\n', '.', '!', '?', ';', ' ', '']
  });

  const allChunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    if (!page.text || page.text.trim().length === 0) continue;

    const docs = await splitter.createDocuments(
      [page.text],
      [{
        documentId: documentId.toString(),
        fileName: fileName,
        page: page.pageNumber
      }]
    );

    for (const doc of docs) {
      allChunks.push({
        id: `${documentId}_chunk_${chunkIndex++}`,
        pageContent: doc.pageContent.trim(),
        metadata: {
          ...doc.metadata,
          chunkIndex: chunkIndex - 1
        }
      });
    }
  }

  return allChunks;
}
