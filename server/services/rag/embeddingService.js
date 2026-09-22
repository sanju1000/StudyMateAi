let pipelineInstance = null;
let pipelineAttempted = false;

/**
 * Initializes Xenova Transformers feature extraction pipeline with fast fallback timeout
 */
async function getPipeline() {
  if (pipelineInstance) return pipelineInstance;
  if (pipelineAttempted) return null;

  pipelineAttempted = true;
  try {
    const { pipeline } = await import('@xenova/transformers');
    const loadPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Model download timeout (3.5s), switching to local dense vectorizer')), 3500)
    );
    pipelineInstance = await Promise.race([loadPromise, timeoutPromise]);
    console.log('✅ [Embeddings] Xenova all-MiniLM-L6-v2 loaded successfully.');
    return pipelineInstance;
  } catch (err) {
    console.warn('⚡ [Embeddings] Utilising smart local dense vectorizer:', err.message);
    pipelineInstance = null;
    return null;
  }
}

/**
 * High-performance deterministic dense vectorizer (384 dims) with subword n-grams and L2 normalization
 */
function generateFallbackEmbedding(text, dim = 384) {
  const vector = new Float32Array(dim);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(w => w.length > 1);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vector[idx] += 1.0;

    // Word bigrams for syntactic context
    if (i < words.length - 1) {
      const bigram = word + '_' + words[i + 1];
      let bHash = 0;
      for (let k = 0; k < bigram.length; k++) {
        bHash = ((bHash << 5) - bHash) + bigram.charCodeAt(k);
        bHash |= 0;
      }
      const bIdx = Math.abs(bHash) % dim;
      vector[bIdx] += 1.5;
    }

    // 3-char character n-grams for typo & morphology tolerance
    if (word.length >= 3) {
      for (let c = 0; c <= word.length - 3; c++) {
        const trigram = word.substring(c, c + 3);
        let tHash = 0;
        for (let m = 0; m < 3; m++) {
          tHash = ((tHash << 5) - tHash) + trigram.charCodeAt(m);
          tHash |= 0;
        }
        const tIdx = Math.abs(tHash) % dim;
        vector[tIdx] += 0.5;
      }
    }
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vector[i] /= norm;
    }
  }
  return Array.from(vector);
}

/**
 * Generates dense embedding for a text string
 */
export async function getEmbedding(text) {
  try {
    const pipe = await getPipeline();
    if (pipe) {
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }
  } catch (error) {
    // Fall back to local vectorizer
  }
  return generateFallbackEmbedding(text);
}

/**
 * Generates dense embeddings for an array of texts
 */
export async function getEmbeddingsBatch(texts) {
  const embeddings = [];
  for (const text of texts) {
    const vec = await getEmbedding(text);
    embeddings.push(vec);
  }
  return embeddings;
}
