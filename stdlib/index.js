/**
 * stdlib/index.js
 * Main stdlib entry point
 * Exports all core stdlib modules
 */

import identity from './identity.js';
import metabolism from './metabolism.js';
import witness from './witness.js';
import memory from './memory.js';
import swarm from './swarm.js';
import hire from './hire.js';
import receipt from './receipt.js';

/**
 * Standard Library API
 * Provides clean interface to all stdlib modules
 */
export const stdlib = {
  // Identity module - BIPỌ̀N39, roles, namespaces
  identity: {
    createIdentity: (mnemonic, role) => identity.createIdentity(mnemonic, role),
    registerRole: (name, config) => identity.registerRole(name, config),
    assignRole: (agentId, role) => identity.assignRole(agentId, role),
    createNamespace: (name, members) => identity.createNamespace(name, members),
    getIdentity: (agentId) => identity.getIdentity(agentId),
    listAgents: () => identity.listAgents()
  },

  // Metabolism module - Dopamine, Synapse, tokenomics
  metabolism: {
    createWallet: (agentId, balance) => metabolism.createWallet(agentId, balance),
    emitDopamine: (agentId, amount, reason) => metabolism.emitDopamine(agentId, amount, reason),
    stake: (agentId, amount) => metabolism.stake(agentId, amount),
    unstake: (agentId) => metabolism.unstake(agentId),
    dopamineToSynapse: (agentId, amount) => metabolism.dopamineToSynapse(agentId, amount),
    slash: (agentId, reason) => metabolism.slash(agentId, reason),
    applyMetabolism: (agentId) => metabolism.applyMetabolism(agentId),
    getBalance: (agentId) => metabolism.getBalance(agentId),
    getHistory: (agentId, limit) => metabolism.getHistory(agentId, limit),
    updateRules: (rules) => metabolism.updateRules(rules)
  },

  // Witness module - Event logging and observation
  witness: {
    logEvent: (type, data, agent) => witness.logEvent(type, data, agent),
    observe: (type, callback) => witness.observe(type, callback),
    stopObserving: (type, callback) => witness.stopObserving(type, callback),
    getEvents: (filter) => witness.getEvents(filter),
    getEvent: (eventId) => witness.getEvent(eventId),
    getWitness: (eventId) => witness.getWitness(eventId),
    evolve: (type, metadata) => witness.evolve(type, metadata),
    getStats: () => witness.getStats()
  },

  // Memory module - Remember, retrieve, storage
  memory: {
    remember: (key, value, metadata) => memory.remember(key, value, metadata),
    retrieve: (key) => memory.retrieve(key),
    retrieveFull: (key) => memory.retrieveFull(key),
    searchByTag: (tag) => memory.searchByTag(tag),
    search: (criteria) => memory.search(criteria),
    forget: (key) => memory.forget(key),
    clearExpired: () => memory.clearExpired(),
    getStats: () => memory.getStats(),
    listAll: () => memory.listAll()
  },

  // Swarm module - Team and coordination
  swarm: {
    createSwarm: (name, config) => swarm.createSwarm(name, config),
    addToSwarm: (name, agentId, role) => swarm.addToSwarm(name, agentId, role),
    removeFromSwarm: (name, agentId) => swarm.removeFromSwarm(name, agentId),
    createTeam: (name, members, config) => swarm.createTeam(name, members, config),
    coordinate: (id, task, agents) => swarm.coordinate(id, task, agents),
    updateCoordination: (id, agentId, result) => swarm.updateCoordination(id, agentId, result),
    finalizeCoordination: (id) => swarm.finalizeCoordination(id),
    broadcast: (swarm, message) => swarm.broadcast(swarm, message),
    getSwarmStatus: (name) => swarm.getSwarmStatus(name),
    getTeamInfo: (name) => swarm.getTeamInfo(name),
    listSwarms: () => swarm.listSwarms(),
    listTeams: () => swarm.listTeams()
  },

  // Hire module - Skill and agent delegation
  hire: {
    registerSkill: (name, config) => hire.registerSkill(name, config),
    getSkill: (name) => hire.getSkill(name),
    listSkills: () => hire.listSkills(),
    hireAgent: (agentId, task, config) => hire.hireAgent(agentId, task, config),
    executeHire: (hireId, result) => hire.executeHire(hireId, result),
    completeHire: (hireId) => hire.completeHire(hireId),
    createContract: (id, delegator, delegatee, skill, terms) => hire.createContract(id, delegator, delegatee, skill, terms),
    executeSkill: (contractId, input) => hire.executeSkill(contractId, input),
    terminateContract: (contractId) => hire.terminateContract(contractId),
    registerAgent: (agentId, config) => hire.registerAgent(agentId, config),
    addSkillToAgent: (agentId, skill) => hire.addSkillToAgent(agentId, skill),
    getAgent: (agentId) => hire.getAgent(agentId),
    getHireStatus: (hireId) => hire.getHireStatus(hireId),
    listContracts: () => hire.listContracts()
  },

  // Receipt module - Transaction proofs and audit chain
  receipt: {
    createReceipt: (type, data, agent) => receipt.createReceipt(type, data, agent),
    getReceipt: (receiptId) => receipt.getReceipt(receiptId),
    transact: (type, data, agent) => receipt.transact(type, data, agent),
    seal: (receiptId) => receipt.seal(receiptId),
    merkleProof: (receiptId) => receipt.merkleProof(receiptId),
    createChain: (agentId) => receipt.createChain(agentId),
    addToChain: (agentId, receiptId) => receipt.addToChain(agentId, receiptId),
    getChain: (agentId) => receipt.getChain(agentId),
    verify: (receiptId) => receipt.verify(receiptId),
    getAllReceipts: (filter) => receipt.getAllReceipts(filter),
    getStats: () => receipt.getStats()
  }
};

export default stdlib;
