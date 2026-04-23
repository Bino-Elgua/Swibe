/**
 * stdlib/memory.js
 * Memory and storage management module
 */

export class MemoryModule {
  constructor() {
    this.memories = new Map();
    this.tags = new Map();
    this.retrievalStats = new Map();
  }

  /**
   * Remember a fact or context
   * @param {string} key - Memory key identifier
   * @param {any} value - Value to store
   * @param {object} metadata - Optional metadata
   */
  remember(key, value, metadata = {}) {
    const memory = {
      key,
      value,
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 0,
      metadata: {
        type: metadata.type || 'general',
        importance: metadata.importance || 'normal',
        ttl: metadata.ttl || null, // null = never expire
        tags: metadata.tags || [],
        ...metadata
      }
    };
    
    this.memories.set(key, memory);
    
    // Index by tags
    memory.metadata.tags.forEach(tag => {
      if (!this.tags.has(tag)) this.tags.set(tag, []);
      this.tags.get(tag).push(key);
    });
    
    return memory;
  }

  /**
   * Retrieve a memory
   * @param {string} key - Memory key
   */
  retrieve(key) {
    const memory = this.memories.get(key);
    if (!memory) return null;
    
    // Update access stats
    memory.accessed = Date.now();
    memory.accessCount++;
    
    if (!this.retrievalStats.has(key)) {
      this.retrievalStats.set(key, 0);
    }
    this.retrievalStats.set(key, this.retrievalStats.get(key) + 1);
    
    return memory.value;
  }

  /**
   * Retrieve full memory object (with metadata)
   * @param {string} key - Memory key
   */
  retrieveFull(key) {
    const memory = this.memories.get(key);
    if (!memory) return null;
    
    memory.accessed = Date.now();
    memory.accessCount++;
    return memory;
  }

  /**
   * Search memories by tag
   * @param {string} tag - Tag to search
   */
  searchByTag(tag) {
    const keys = this.tags.get(tag) || [];
    return keys.map(key => this.memories.get(key).value);
  }

  /**
   * Search memories by metadata criteria
   * @param {object} criteria - Search criteria
   */
  search(criteria = {}) {
    const results = [];
    
    this.memories.forEach((memory, key) => {
      let matches = true;
      
      if (criteria.type && memory.metadata.type !== criteria.type) matches = false;
      if (criteria.importance && memory.metadata.importance !== criteria.importance) matches = false;
      if (criteria.since && memory.created < criteria.since) matches = false;
      if (criteria.tags) {
        const hasTags = criteria.tags.some(tag => memory.metadata.tags.includes(tag));
        if (!hasTags) matches = false;
      }
      
      if (matches) results.push(memory);
    });
    
    return results;
  }

  /**
   * Forget a memory
   * @param {string} key - Memory key to forget
   */
  forget(key) {
    const memory = this.memories.get(key);
    if (!memory) return false;
    
    // Remove from tag index
    memory.metadata.tags.forEach(tag => {
      const keys = this.tags.get(tag);
      if (keys) {
        const idx = keys.indexOf(key);
        if (idx > -1) keys.splice(idx, 1);
      }
    });
    
    this.memories.delete(key);
    return true;
  }

  /**
   * Clear old memories based on TTL
   */
  clearExpired() {
    const now = Date.now();
    const expired = [];
    
    this.memories.forEach((memory, key) => {
      if (memory.metadata.ttl && now - memory.created > memory.metadata.ttl) {
        expired.push(key);
      }
    });
    
    expired.forEach(key => this.forget(key));
    return expired;
  }

  /**
   * Get memory statistics
   */
  getStats() {
    return {
      totalMemories: this.memories.size,
      totalTags: this.tags.size,
      byType: this._getTypeStats(),
      mostAccessed: this._getMostAccessed(5),
      byImportance: this._getImportanceStats()
    };
  }

  /**
   * Get all memories (with keys)
   */
  listAll() {
    const list = [];
    this.memories.forEach((memory, key) => {
      list.push({ key, ...memory });
    });
    return list;
  }

  /**
   * Clear all memories (for testing)
   */
  reset() {
    this.memories.clear();
    this.tags.clear();
    this.retrievalStats.clear();
  }

  /**
   * Internal: Get type statistics
   */
  _getTypeStats() {
    const stats = {};
    this.memories.forEach(memory => {
      const type = memory.metadata.type;
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  }

  /**
   * Internal: Get importance statistics
   */
  _getImportanceStats() {
    const stats = {};
    this.memories.forEach(memory => {
      const imp = memory.metadata.importance;
      stats[imp] = (stats[imp] || 0) + 1;
    });
    return stats;
  }

  /**
   * Internal: Get most accessed memories
   */
  _getMostAccessed(limit = 5) {
    const sorted = Array.from(this.retrievalStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key]) => ({ key, accessCount: this.retrievalStats.get(key) }));
    return sorted;
  }
}

export default new MemoryModule();
