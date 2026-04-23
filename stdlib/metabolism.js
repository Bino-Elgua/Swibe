/**
 * stdlib/metabolism.js
 * Tokenomics module: Dopamine, Synapse, staking, slashing
 */

export class MetabolismModule {
  constructor() {
    this.wallets = new Map();
    this.transactions = [];
    this.metabolismRules = {
      dopamineEmission: 1.0,    // Base dopamine per action
      synapseConversion: 0.1,   // Synapse per dopamine
      stakingAPY: 0.12,         // 12% annual return
      slashPercentage: 0.05,    // 5% slash on violation
      metabolismRate: 0.98      // 2% burn per period
    };
  }

  /**
   * Create agent wallet
   * @param {string} agentId - Agent identifier
   * @param {number} initialBalance - Starting dopamine
   */
  createWallet(agentId, initialBalance = 1000) {
    const wallet = {
      agentId,
      dopamine: initialBalance,
      synapse: 0,
      staked: 0,
      lastUpdate: Date.now(),
      txHistory: []
    };
    this.wallets.set(agentId, wallet);
    return wallet;
  }

  /**
   * Emit dopamine (reward for action)
   * @param {string} agentId - Agent ID
   * @param {number} amount - Dopamine amount
   * @param {string} reason - Reason for emission
   */
  emitDopamine(agentId, amount = 1, reason = 'action') {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    
    wallet.dopamine += amount;
    wallet.txHistory.push({
      type: 'dopamine_emit',
      amount,
      reason,
      timestamp: Date.now()
    });
    return wallet;
  }

  /**
   * Stake dopamine for synapse generation
   * @param {string} agentId - Agent ID
   * @param {number} amount - Amount to stake
   */
  stake(agentId, amount) {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    if (wallet.dopamine < amount) throw new Error('Insufficient dopamine');
    
    wallet.dopamine -= amount;
    wallet.staked += amount;
    wallet.txHistory.push({
      type: 'stake',
      amount,
      timestamp: Date.now()
    });
    return wallet;
  }

  /**
   * Unstake and collect synapse interest
   * @param {string} agentId - Agent ID
   */
  unstake(agentId) {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    
    const staked = wallet.staked;
    const interest = Math.floor(staked * this.metabolismRules.stakingAPY);
    
    wallet.dopamine += staked + interest;
    wallet.staked = 0;
    wallet.txHistory.push({
      type: 'unstake',
      staked,
      interest,
      timestamp: Date.now()
    });
    return { wallet, interest };
  }

  /**
   * Convert dopamine to synapse (1:0.1 ratio)
   * @param {string} agentId - Agent ID
   * @param {number} amount - Dopamine to convert
   */
  dopamineToSynapse(agentId, amount) {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    if (wallet.dopamine < amount) throw new Error('Insufficient dopamine');
    
    const synapseGain = amount * this.metabolismRules.synapseConversion;
    wallet.dopamine -= amount;
    wallet.synapse += synapseGain;
    
    wallet.txHistory.push({
      type: 'convert',
      dopamineSpent: amount,
      synapseGained: synapseGain,
      timestamp: Date.now()
    });
    return wallet;
  }

  /**
   * Slash wallet for violation
   * @param {string} agentId - Agent ID
   * @param {string} reason - Reason for slash
   */
  slash(agentId, reason = 'violation') {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    
    const slashAmount = Math.floor(wallet.dopamine * this.metabolismRules.slashPercentage);
    wallet.dopamine -= slashAmount;
    
    wallet.txHistory.push({
      type: 'slash',
      amount: slashAmount,
      reason,
      timestamp: Date.now()
    });
    return { wallet, slashAmount };
  }

  /**
   * Apply metabolism (token burn)
   * @param {string} agentId - Agent ID
   */
  applyMetabolism(agentId) {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    
    const burnAmount = Math.floor(wallet.dopamine * (1 - this.metabolismRules.metabolismRate));
    wallet.dopamine -= burnAmount;
    
    wallet.txHistory.push({
      type: 'metabolism_burn',
      amount: burnAmount,
      timestamp: Date.now()
    });
    return wallet;
  }

  /**
   * Get wallet balance
   * @param {string} agentId - Agent ID
   */
  getBalance(agentId) {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    return {
      dopamine: wallet.dopamine,
      synapse: wallet.synapse,
      staked: wallet.staked,
      total: wallet.dopamine + wallet.staked
    };
  }

  /**
   * Get transaction history
   * @param {string} agentId - Agent ID
   */
  getHistory(agentId, limit = 50) {
    const wallet = this.wallets.get(agentId);
    if (!wallet) throw new Error(`Wallet not found: ${agentId}`);
    return wallet.txHistory.slice(-limit);
  }

  /**
   * Update metabolism rules
   * @param {object} newRules - Partial rules to update
   */
  updateRules(newRules) {
    this.metabolismRules = { ...this.metabolismRules, ...newRules };
    return this.metabolismRules;
  }
}

export default new MetabolismModule();
