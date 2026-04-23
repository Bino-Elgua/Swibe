/**
 * stdlib/hire.js
 * Skill hiring and agent delegation module
 */

export class HireModule {
  constructor() {
    this.skills = new Map();
    this.hires = new Map();
    this.agents = new Map();
    this.contracts = new Map();
  }

  /**
   * Register a skill
   * @param {string} skillName - Skill identifier
   * @param {object} config - Skill configuration
   */
  registerSkill(skillName, config = {}) {
    const skill = {
      name: skillName,
      description: config.description || '',
      prompt: config.prompt || '',
      requirements: config.requirements || [],
      costInDopamine: config.cost || 10,
      loopUntilGoal: config.loopUntilGoal || null,
      examples: config.examples || [],
      metadata: config.metadata || {},
      registered: Date.now()
    };
    
    this.skills.set(skillName, skill);
    return skill;
  }

  /**
   * Get skill information
   * @param {string} skillName - Skill name
   */
  getSkill(skillName) {
    return this.skills.get(skillName);
  }

  /**
   * List all available skills
   */
  listSkills() {
    return Array.from(this.skills.values());
  }

  /**
   * Hire an agent for a task
   * @param {string} agentId - Agent ID to hire
   * @param {string} taskDescription - Task description
   * @param {object} config - Hire configuration
   */
  hireAgent(agentId, taskDescription, config = {}) {
    const hire = {
      id: `hire-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      task: taskDescription,
      state: 'pending',
      costEstimate: config.costEstimate || 0,
      maxIterations: config.maxIterations || 5,
      timeLimit: config.timeLimit || null,
      result: null,
      startTime: Date.now(),
      endTime: null,
      iterations: 0
    };
    
    this.hires.set(hire.id, hire);
    return hire;
  }

  /**
   * Execute hired task
   * @param {string} hireId - Hire ID
   * @param {any} result - Task result
   */
  executeHire(hireId, result) {
    const hire = this.hires.get(hireId);
    if (!hire) throw new Error(`Hire not found: ${hireId}`);
    
    hire.state = 'executing';
    hire.iterations++;
    hire.result = result;
    
    return hire;
  }

  /**
   * Complete hired task
   * @param {string} hireId - Hire ID
   */
  completeHire(hireId) {
    const hire = this.hires.get(hireId);
    if (!hire) throw new Error(`Hire not found: ${hireId}`);
    
    hire.state = 'completed';
    hire.endTime = Date.now();
    return hire;
  }

  /**
   * Create a delegation contract
   * @param {string} contractId - Contract identifier
   * @param {string} delegator - Delegating agent
   * @param {string} delegatee - Agent accepting delegation
   * @param {string} skillName - Skill being delegated
   * @param {object} terms - Contract terms
   */
  createContract(contractId, delegator, delegatee, skillName, terms = {}) {
    const contract = {
      id: contractId,
      delegator,
      delegatee,
      skill: skillName,
      compensation: terms.compensation || 0,
      duration: terms.duration || null,
      permissions: terms.permissions || [],
      state: 'active',
      created: Date.now(),
      executions: 0
    };
    
    this.contracts.set(contractId, contract);
    return contract;
  }

  /**
   * Execute a delegated skill
   * @param {string} contractId - Contract ID
   * @param {any} input - Skill input
   */
  executeSkill(contractId, input) {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error(`Contract not found: ${contractId}`);
    
    const skill = this.skills.get(contract.skill);
    if (!skill) throw new Error(`Skill not found: ${contract.skill}`);
    
    contract.executions++;
    
    return {
      contractId,
      skill: skill.name,
      input,
      prompt: skill.prompt,
      executionCount: contract.executions
    };
  }

  /**
   * Terminate contract
   * @param {string} contractId - Contract ID
   */
  terminateContract(contractId) {
    const contract = this.contracts.get(contractId);
    if (!contract) throw new Error(`Contract not found: ${contractId}`);
    
    contract.state = 'terminated';
    return contract;
  }

  /**
   * Register custom agent
   * @param {string} agentId - Agent identifier
   * @param {object} config - Agent configuration
   */
  registerAgent(agentId, config = {}) {
    const agent = {
      id: agentId,
      skills: config.skills || [],
      maxConcurrent: config.maxConcurrent || 5,
      availability: config.availability || 'available',
      metadata: config.metadata || {},
      registered: Date.now(),
      activeHires: 0
    };
    
    this.agents.set(agentId, agent);
    return agent;
  }

  /**
   * Add skill to agent
   * @param {string} agentId - Agent ID
   * @param {string} skillName - Skill name
   */
  addSkillToAgent(agentId, skillName) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
    
    if (!agent.skills.includes(skillName)) {
      agent.skills.push(skillName);
    }
    return agent;
  }

  /**
   * Get agent info
   * @param {string} agentId - Agent ID
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Get hire status
   * @param {string} hireId - Hire ID
   */
  getHireStatus(hireId) {
    return this.hires.get(hireId);
  }

  /**
   * List all contracts
   */
  listContracts() {
    return Array.from(this.contracts.values());
  }
}

export default new HireModule();
