import mongoose from 'mongoose';
import { localStore } from '../services/db/localStore.js';
import bcrypt from 'bcryptjs';

/**
 * Creates a smart dual-mode model that uses Mongoose if connected, or localStore if offline
 */
export function createSmartModel(collectionName, mongooseModel, customMethods = {}) {
  const isMongoConnected = () => mongoose.connection.readyState === 1;

  return {
    find(filter = {}) {
      if (isMongoConnected()) {
        return mongooseModel.find(filter);
      }
      const raw = localStore.find(collectionName, filter);
      let results = raw.map(item => attachMethods(item, customMethods, collectionName));

      const queryObj = {
        _results: results,
        sort(sortArg) {
          return this;
        },
        limit(n) {
          this._results = this._results.slice(0, n);
          return this;
        },
        select() {
          return this;
        },
        then(resolve, reject) {
          return Promise.resolve(this._results).then(resolve, reject);
        },
        catch(reject) {
          return Promise.resolve(this._results).catch(reject);
        }
      };
      return queryObj;
    },

    findOne(filter = {}) {
      if (isMongoConnected()) {
        return mongooseModel.findOne(filter);
      }
      const raw = localStore.findOne(collectionName, filter);
      const attached = raw ? attachMethods(raw, customMethods, collectionName) : null;

      const queryObj = {
        _result: attached,
        select() {
          return this;
        },
        then(resolve, reject) {
          return Promise.resolve(this._result).then(resolve, reject);
        },
        catch(reject) {
          return Promise.resolve(this._result).catch(reject);
        }
      };
      return queryObj;
    },

    findById(id) {
      if (isMongoConnected()) {
        return mongooseModel.findById(id);
      }
      const raw = localStore.findById(collectionName, id);
      const attached = raw ? attachMethods(raw, customMethods, collectionName) : null;

      const queryObj = {
        _result: attached,
        select() {
          return this;
        },
        then(resolve, reject) {
          return Promise.resolve(this._result).then(resolve, reject);
        },
        catch(reject) {
          return Promise.resolve(this._result).catch(reject);
        }
      };
      return queryObj;
    },

    async create(data) {
      if (isMongoConnected()) {
        return mongooseModel.create(data);
      }
      // Hash password if User
      if (collectionName === 'users' && data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }
      const result = localStore.create(collectionName, data);
      return attachMethods(result, customMethods, collectionName);
    },

    async findByIdAndUpdate(id, updates, options) {
      if (isMongoConnected()) {
        return mongooseModel.findByIdAndUpdate(id, updates, options || { new: true });
      }
      const result = localStore.findByIdAndUpdate(collectionName, id, updates);
      return result ? attachMethods(result, customMethods, collectionName) : null;
    },

    async findByIdAndDelete(id) {
      if (isMongoConnected()) {
        return mongooseModel.findByIdAndDelete(id);
      }
      const result = localStore.findByIdAndDelete(collectionName, id);
      return result ? attachMethods(result, customMethods, collectionName) : null;
    },

    async findOneAndDelete(filter = {}) {
      if (isMongoConnected()) {
        return mongooseModel.findOneAndDelete(filter);
      }
      const item = localStore.findOne(collectionName, filter);
      if (item) {
        return localStore.findByIdAndDelete(collectionName, item._id);
      }
      return null;
    },

    async deleteMany(filter = {}) {
      if (isMongoConnected()) {
        return mongooseModel.deleteMany(filter);
      }
      return localStore.deleteMany(collectionName, filter);
    },

    async countDocuments(filter = {}) {
      if (isMongoConnected()) {
        return mongooseModel.countDocuments(filter);
      }
      return localStore.countDocuments(collectionName, filter);
    }
  };
}

function attachMethods(item, customMethods, collectionName) {
  if (!item) return item;
  const clone = { ...item };

  clone.toObject = () => ({ ...clone });
  clone.save = async () => {
    localStore.findByIdAndUpdate(collectionName, clone._id, clone);
    return clone;
  };

  if (collectionName === 'users') {
    clone.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  for (const [methodName, fn] of Object.entries(customMethods)) {
    clone[methodName] = fn.bind(clone);
  }

  return clone;
}
