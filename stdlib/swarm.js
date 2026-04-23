/**
 * stdlib/swarm.js
 * Swarm coordination and team management module
 */

export class SwarmModule {
  constructor() {
    this.swarms = new Map();
    this.teams = new Map();
    this.coordinates = new Map();
    this.broadcasts = [];
  }

  /**
   * Create a swarm
   * @param {string} swarmName - Swarm identifier
   * @param {object} config - Swarm configuration
   */
  createSwarm(swarmName, config = {}) {
    const swarm = {
      name: swarmName,
      agents: [],
      leader: config.leader || null,
      consensus: config.consensus || 'majority',
      sync: config.sync || 'async',
      metadata: config.metadata || {},
      created: Date.now(),
      activity: []
    };
    
    this.swarms.set(swarmName, swarm);
    return swarm;
  }

  /**
   * Add agent to swarm
   * @param {string} swarmName - Swarm name
   * @param {string} agentId - Agent ID
   * @param {object} role - Role/config for agent
   */
  addToSwarm(swarmName, agentId, role = {}) {
    const swarm = this.swarms.get(swarmName);
    if (!swarm) throw new Error(`Swarm not found: ${swarmName}`);
    
    swarm.agents.push({
      id: agentId,
      role: role.name || 'member',
      permissions: role.permissions || [],
      joinedAt: Date.now()
    });
    
    swarm.activity.push({
      type: 'agent_joined',
      agentId,
      timestamp: Date.now()
    });
    
    return swarm;
  }

  /**
   * Remove agent from swarm
   * @param {string} swarmName - Swarm name
   * @param {string} agentId - Agent ID
   */
  removeFromSwarm(swarmName, agentId) {
    const swarm = this.swarms.get(swarmName);
    if (!swarm) throw new Error(`Swarm not found: ${swarmName}`);
    
    const idx = swarm.agents.findIndex(a => a.id === agentId);
    if (idx > -1) {
      swarm.agents.splice(idx, 1);
      swarm.activity.push({
        type: 'agent_left',
        agentId,
        timestamp: Date.now()
      });
    }
    return swarm;
  }

  /**
   * Create a team (named group of agents)
   * @param {string} teamName - Team identifier
   * @param {array} agentIds - Agent IDs in team
   * @param {object} config - Team configuration
   */
  createTeam(teamName, agentIds = [], config = {}) {
    const team = {
      name: teamName,
      members: agentIds,
      architect: config.architect || null,
      coder: config.coder || null,
      skills: config.skills || [],
      metadata: config.metadata || {},
      created: Date.now()
    };
    
    this.teams.set(teamName, team);
    return team;
  }

  /**
   * Coordinate a distributed task
   * @param {string} coordinationId - Coordination identifier
   * @param {string} taskDescription - Task description
   * @param {array} agentIds - Agents to coordinate
   */
  coordinate(coordinationId, taskDescription, agentIds = []) {
    const coordination = {
      id: coordinationId,
      task: taskDescription,
      agents: agentIds,
      state: 'pending',
      results: {},
      startTime: Date.now(),
      endTime: null,
      steps: []
    };
    
    this.coordinates.set(coordinationId, coordination);
    return coordination;
  }

  /**
   * Update coordination step
   * @param {string} coordinationId - Coordination ID
   * @param {string} agentId - Agent that completed step
   * @param {object} result - Step result
   */
  updateCoordination(coordinationId, agentId, result) {
    const coord = this.coordinates.get(coordinationId);
    if (!coord) throw new Error(`Coordination not found: ${coordinationId}`);
    
    coord.results[agentId] = result;
    coord.steps.push({
      agent: agentId,
      result,
      timestamp: Date.now()
    });
    
    return coord;
  }

  /**
   * Finalize coordination
   * @param {string} coordinationId - Coordination ID
   */
  finalizeCoordination(coordinationId) {
    const coord = this.coordinates.get(coordinationId);
    if (!coord) throw new Error(`Coordination not found: ${coordinationId}`);
    
    coord.state = 'completed';
    coord.endTime = Date.now();
    return coord;
  }

  /**
   * Broadcast message to swarm
   * @param {string} swarmName - Swarm name
   * @param {object} message - Message to broadcast
   */
  broadcast(swarmName, message) {
    const swarm = this.swarms.get(swarmName);
    if (!swarm) throw new Error(`Swarm not found: ${swarmName}`);
    
    const broadcast = {
      id: Math.random().toString(36).substr(2, 9),
      swarm: swarmName,
      message,
      sentAt: Date.now(),
      recipients: swarm.agents.length
    };
    
    this.broadcasts.push(broadcast);
    return broadcast;
  }

  /**
   * Get swarm status
   * @param {string} swarmName - Swarm name
   */
  getSwarmStatus(swarmName) {
    const swarm = this.swarms.get(swarmName);
    if (!swarm) throw new Error(`Swarm not found: ${swarmName}`);
    
    return {
      name: swarm.name,
      agentCount: swarm.agents.length,
      agents: swarm.agents,
      leader: swarm.leader,
      consensus: swarm.consensus,
      created: swarm.created,
      recentActivity: swarm.activity.slice(-10)
    };
  }

  /**
   * Get team info
   * @param {string} teamName - Team name
   */
  getTeamInfo(teamName) {
    return this.teams.get(teamName);
  }

  /**
   * List all swarms
   */
  listSwarms() {
    return Array.from(this.swarms.values());
  }

  /**
   * List all teams
   */
  listTeams() {
    return Array.from(this.teams.values());
  }
}

export default new SwarmModule();
