/**
 * stdlib/identity.js
 * Agent identity module
 * Wraps BIPỌ̀N39 identity generation with role management
 */

import { generateAgentIdentity } from '../src/bipon39/agent-identity.js';

export class IdentityModule {
  constructor() {
    this.agents = new Map();
    this.roleRegistry = new Map();
    this.nameSpaces = new Map();
  }

  /**
   * Create an agent identity
   * @param {string} mnemonic - BIP39-style mnemonic (optional, auto-generated)
   * @param {string} role - Agent role/archetype
   * @returns {object} Agent identity with ID, keys, metadata
   */
  async createIdentity(mnemonic, role = 'general') {
    try {
      const identity = await generateAgentIdentity(mnemonic || undefined);
      identity.role = role;
      identity.created = Date.now();
      
      this.agents.set(identity.id, identity);
      return identity;
    } catch (error) {
      throw new Error(`Identity creation failed: ${error.message}`);
    }
  }

  /**
   * Register a role archetype
   * @param {string} roleName - Role identifier
   * @param {object} config - Role configuration
   */
  registerRole(roleName, config = {}) {
    this.roleRegistry.set(roleName, {
      name: roleName,
      permissions: config.permissions || [],
      capabilities: config.capabilities || [],
      tier: config.tier || 'standard',
      metadata: config.metadata || {}
    });
  }

  /**
   * Assign role to agent
   * @param {string} agentId - Agent ID
   * @param {string} roleName - Role name
   */
  assignRole(agentId, roleName) {
    const agent = this.agents.get(agentId);
    const role = this.roleRegistry.get(roleName);
    
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
    if (!role) throw new Error(`Role not found: ${roleName}`);
    
    agent.role = roleName;
    agent.permissions = role.permissions;
    agent.capabilities = role.capabilities;
    return agent;
  }

  /**
   * Create a namespace (team, collective)
   * @param {string} namespace - Namespace identifier
   * @param {array} memberIds - Agent IDs in namespace
   */
  createNamespace(namespace, memberIds = []) {
    this.nameSpaces.set(namespace, {
      name: namespace,
      members: memberIds,
      created: Date.now()
    });
    return this.nameSpaces.get(namespace);
  }

  /**
   * Get agent identity
   * @param {string} agentId - Agent ID
   */
  getIdentity(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * List all agents
   */
  listAgents() {
    return Array.from(this.agents.values());
  }
}

export default new IdentityModule();
