"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = exports.cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
class CacheService {
    constructor(ttlSeconds = 3600) {
        this.cache = new node_cache_1.default({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false,
        });
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value, ttl) {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }
    del(key) {
        return this.cache.del(key);
    }
    flush() {
        this.cache.flushAll();
    }
    // Cache decorator for methods
    static cache(ttl) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            const cache = new node_cache_1.default({ stdTTL: ttl || 300 });
            descriptor.value = async function (...args) {
                const key = `${propertyKey}:${JSON.stringify(args)}`;
                const cached = cache.get(key);
                if (cached) {
                    return cached;
                }
                const result = await originalMethod.apply(this, args);
                cache.set(key, result);
                return result;
            };
            return descriptor;
        };
    }
}
exports.CacheService = CacheService;
exports.cache = new CacheService();
