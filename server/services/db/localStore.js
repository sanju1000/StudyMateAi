import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '../../data/studymate_db.json');

// Ensure data folder exists
const dataDir = path.dirname(dbFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial DB template
const defaultDb = {
  users: [],
  documents: [],
  conversations: [],
  messages: [],
  mcqs: [],
  flashcards: []
};

function readDb() {
  try {
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(defaultDb));
    }
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('[LocalStore] Read error, resetting db:', e);
    return JSON.parse(JSON.stringify(defaultDb));
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[LocalStore] Write error:', e);
  }
}

export function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

export const localStore = {
  find(collection, filter = {}) {
    const db = readDb();
    const items = db[collection] || [];
    return items.filter(item => matchFilter(item, filter));
  },

  findOne(collection, filter = {}) {
    const items = this.find(collection, filter);
    return items.length > 0 ? { ...items[0] } : null;
  },

  findById(collection, id) {
    return this.findOne(collection, { _id: id });
  },

  create(collection, data) {
    const db = readDb();
    if (!db[collection]) db[collection] = [];
    const newItem = {
      _id: data._id || generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db[collection].push(newItem);
    writeDb(db);
    return { ...newItem };
  },

  findByIdAndUpdate(collection, id, updates) {
    const db = readDb();
    const items = db[collection] || [];
    const index = items.findIndex(i => String(i._id) === String(id));
    if (index === -1) return null;

    db[collection][index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    return { ...db[collection][index] };
  },

  findByIdAndDelete(collection, id) {
    const db = readDb();
    const items = db[collection] || [];
    const index = items.findIndex(i => String(i._id) === String(id));
    if (index === -1) return null;

    const removed = items.splice(index, 1)[0];
    writeDb(db);
    return removed;
  },

  deleteMany(collection, filter = {}) {
    const db = readDb();
    const items = db[collection] || [];
    const keep = items.filter(item => !matchFilter(item, filter));
    const deletedCount = items.length - keep.length;
    db[collection] = keep;
    writeDb(db);
    return { deletedCount };
  },

  countDocuments(collection, filter = {}) {
    return this.find(collection, filter).length;
  }
};

function matchFilter(item, filter) {
  for (const key of Object.keys(filter)) {
    const val = filter[key];

    // Handle $in operator
    if (val && typeof val === 'object' && val.$in && Array.isArray(val.$in)) {
      const stringArr = val.$in.map(String);
      if (!stringArr.includes(String(item[key]))) {
        return false;
      }
      continue;
    }

    // Standard equality check
    if (String(item[key]) !== String(val)) {
      return false;
    }
  }
  return true;
}
