/**
 * stdlib/receipt.js
 * Receipt and transaction proof module
 * Maintains merkle chain of agent actions and proofs
 */

import crypto from 'crypto';

export class ReceiptModule {
  constructor() {
    this.receipts = [];
    this.receiptMap = new Map();
    this.chains = new Map();
    this.merkleRoots = [];
  }

  /**
   * Create a receipt for an action
   * @param {string} actionType - Type of action
   * @param {object} data - Action data
   * @param {string} agent - Agent performing action
   */
  createReceipt(actionType, data = {}, agent = 'system') {
    const receipt = {
      hash: null,
      id: crypto.randomUUID(),
      type: actionType,
      data,
      agent,
      timestamp: Date.now(),
      previousHash: this.receipts.length > 0 ? this.receipts[this.receipts.length - 1].hash : null,
      metadata: {
        layer: data.layer || 'execution',
        priority: data.priority || 'normal'
      }
    };
    
    // Compute hash
    receipt.hash = this._hashReceipt(receipt);
    
    this.receipts.push(receipt);
    this.receiptMap.set(receipt.id, receipt);
    
    return receipt;
  }

  /**
   * Get receipt by ID
   * @param {string} receiptId - Receipt ID
   */
  getReceipt(receiptId) {
    return this.receiptMap.get(receiptId);
  }

  /**
   * Create receipt for transaction
   * @param {string} txType - Transaction type
   * @param {object} txData - Transaction data
   * @param {string} agentId - Agent performing transaction
   */
  transact(txType, txData = {}, agentId = 'system') {
    return this.createReceipt(`transaction:${txType}`, txData, agentId);
  }

  /**
   * Seal a receipt (finalize and lock)
   * @param {string} receiptId - Receipt ID
   */
  seal(receiptId) {
    const receipt = this.receiptMap.get(receiptId);
    if (!receipt) throw new Error(`Receipt not found: ${receiptId}`);
    
    receipt.sealed = true;
    receipt.sealedAt = Date.now();
    return receipt;
  }

  /**
   * Create a merkle proof for a receipt
   * @param {string} receiptId - Receipt ID
   */
  merkleProof(receiptId) {
    const receipt = this.receiptMap.get(receiptId);
    if (!receipt) throw new Error(`Receipt not found: ${receiptId}`);
    
    const index = this.receipts.findIndex(r => r.id === receiptId);
    if (index === -1) throw new Error(`Receipt not in chain: ${receiptId}`);
    
    const path = [];
    let level = [this.receipts];
    let targetIndex = index;
    
    while (level.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] || left;
        const sibling = targetIndex % 2 === 0 ? right : left;
        path.push(this._hashReceipt(sibling));
        nextLevel.push([left, right]);
      }
      targetIndex = Math.floor(targetIndex / 2);
      level = nextLevel;
    }
    
    return {
      receiptId,
      index,
      path,
      root: this._computeMerkleRoot()
    };
  }

  /**
   * Create a chain for an agent's receipts
   * @param {string} agentId - Agent ID
   */
  createChain(agentId) {
    const chain = {
      agentId,
      receipts: [],
      root: null,
      created: Date.now()
    };
    
    this.chains.set(agentId, chain);
    return chain;
  }

  /**
   * Add receipt to agent chain
   * @param {string} agentId - Agent ID
   * @param {string} receiptId - Receipt ID
   */
  addToChain(agentId, receiptId) {
    const chain = this.chains.get(agentId);
    if (!chain) throw new Error(`Chain not found for agent: ${agentId}`);
    
    const receipt = this.receiptMap.get(receiptId);
    if (!receipt) throw new Error(`Receipt not found: ${receiptId}`);
    
    chain.receipts.push(receiptId);
    chain.root = this._computeChainRoot(chain.receipts);
    
    return chain;
  }

  /**
   * Get agent's receipt chain
   * @param {string} agentId - Agent ID
   */
  getChain(agentId) {
    const chain = this.chains.get(agentId);
    if (!chain) return null;
    
    return {
      agentId,
      receiptCount: chain.receipts.length,
      receipts: chain.receipts.map(id => this.receiptMap.get(id)),
      root: chain.root,
      created: chain.created
    };
  }

  /**
   * Verify receipt integrity
   * @param {string} receiptId - Receipt ID
   */
  verify(receiptId) {
    const receipt = this.receiptMap.get(receiptId);
    if (!receipt) throw new Error(`Receipt not found: ${receiptId}`);
    
    const computedHash = this._hashReceipt(receipt);
    return {
      valid: computedHash === receipt.hash,
      receiptId,
      originalHash: receipt.hash,
      computedHash,
      sealed: receipt.sealed || false
    };
  }

  /**
   * Get all receipts
   * @param {object} filter - Optional filter
   */
  getAllReceipts(filter = {}) {
    let results = this.receipts;
    
    if (filter.agent) {
      results = results.filter(r => r.agent === filter.agent);
    }
    if (filter.type) {
      results = results.filter(r => r.type === filter.type);
    }
    if (filter.since) {
      results = results.filter(r => r.timestamp >= filter.since);
    }
    if (filter.limit) {
      results = results.slice(-filter.limit);
    }
    
    return results;
  }

  /**
   * Get receipt statistics
   */
  getStats() {
    const typeStats = {};
    const agentStats = {};
    
    this.receipts.forEach(r => {
      typeStats[r.type] = (typeStats[r.type] || 0) + 1;
      agentStats[r.agent] = (agentStats[r.agent] || 0) + 1;
    });
    
    return {
      totalReceipts: this.receipts.length,
      totalChains: this.chains.size,
      receiptsByType: typeStats,
      receiptsByAgent: agentStats,
      sealedReceipts: this.receipts.filter(r => r.sealed).length
    };
  }

  /**
   * Internal: Hash a receipt
   */
  _hashReceipt(receipt) {
    const data = JSON.stringify({
      type: receipt.type,
      data: receipt.data,
      timestamp: receipt.timestamp,
      agent: receipt.agent
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Internal: Compute merkle root of all receipts
   */
  _computeMerkleRoot() {
    if (this.receipts.length === 0) return null;
    
    let hashes = this.receipts.map(r => r.hash);
    
    while (hashes.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        const combined = crypto.createHash('sha256')
          .update(left + right)
          .digest('hex');
        nextLevel.push(combined);
      }
      hashes = nextLevel;
    }
    
    return hashes[0];
  }

  /**
   * Internal: Compute merkle root for agent chain
   */
  _computeChainRoot(receiptIds) {
    if (receiptIds.length === 0) return null;
    
    let hashes = receiptIds.map(id => {
      const r = this.receiptMap.get(id);
      return r ? r.hash : null;
    }).filter(h => h !== null);
    
    if (hashes.length === 0) return null;
    
    while (hashes.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        const combined = crypto.createHash('sha256')
          .update(left + right)
          .digest('hex');
        nextLevel.push(combined);
      }
      hashes = nextLevel;
    }
    
    return hashes[0];
  }

  /**
   * Reset (for testing)
   */
  reset() {
    this.receipts = [];
    this.receiptMap.clear();
    this.chains.clear();
    this.merkleRoots = [];
  }
}

export default new ReceiptModule();
