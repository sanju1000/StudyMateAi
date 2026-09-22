import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import officeParser from 'officeparser';

/**
 * Extracts raw text and page/section breakdowns from supported file formats
 * @param {string} filePath - Absolute path to the file
 * @param {string} fileType - One of 'pdf', 'docx', 'pptx', 'txt'
 * @returns {Promise<{ fullText: string, pageCount: number, pages: Array<{ pageNumber: number, text: string }> }>}
 */
export async function extractDocumentText(filePath, fileType) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const normalizedType = fileType.toLowerCase().replace('.', '');

  switch (normalizedType) {
    case 'pdf': {
      const dataBuffer = fs.readFileSync(filePath);
      // Custom pager to capture page-by-page text
      const pageTexts = [];
      const options = {
        pagerender: function (pageData) {
          return pageData.getTextContent().then(function (textContent) {
            let lastY, text = '';
            for (let item of textContent.items) {
              if (lastY == item.transform[5] || !lastY) {
                text += item.str + ' ';
              } else {
                text += '\n' + item.str + ' ';
              }
              lastY = item.transform[5];
            }
            pageTexts.push(text);
            return text;
          });
        }
      };

      let pdfData;
      try {
        pdfData = await pdfParse(dataBuffer, options);
      } catch (err) {
        // Fallback without custom page render if needed
        pdfData = await pdfParse(dataBuffer);
      }

      const totalPages = pdfData.numpages || (pageTexts.length > 0 ? pageTexts.length : 1);
      const pages = pageTexts.length > 0
        ? pageTexts.map((txt, idx) => ({ pageNumber: idx + 1, text: txt.trim() }))
        : [{ pageNumber: 1, text: pdfData.text.trim() }];

      return {
        fullText: pdfData.text || pageTexts.join('\n\n'),
        pageCount: totalPages,
        pages: pages.filter(p => p.text.length > 0)
      };
    }

    case 'docx': {
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value || '';
      // Approximate pages (roughly 500 words / ~3000 chars per standard typed page)
      const approxPages = Math.max(1, Math.ceil(text.length / 3000));
      return {
        fullText: text,
        pageCount: approxPages,
        pages: [{ pageNumber: 1, text }]
      };
    }

    case 'pptx': {
      let text = '';
      try {
        if (officeParser && typeof officeParser.parseOffice === 'function') {
          text = await officeParser.parseOffice(filePath);
        } else if (typeof officeParser === 'function') {
          text = await officeParser(filePath);
        } else {
          text = await new Promise((resolve, reject) => {
            officeParser.parseOffice(filePath, (data, err) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
        }
      } catch (e) {
        console.warn('officeParser threw error, attempting fallback:', e.message);
        text = fs.readFileSync(filePath, 'utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }

      const approxPages = Math.max(1, Math.ceil(text.length / 1500));
      return {
        fullText: text || 'Presentation text extracted.',
        pageCount: approxPages,
        pages: [{ pageNumber: 1, text: text || '' }]
      };
    }

    case 'txt': {
      const text = await fs.promises.readFile(filePath, 'utf-8');
      const approxPages = Math.max(1, Math.ceil(text.length / 3000));
      return {
        fullText: text,
        pageCount: approxPages,
        pages: [{ pageNumber: 1, text }]
      };
    }

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
