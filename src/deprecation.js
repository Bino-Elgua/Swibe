/**
 * Swibe v4.0 Deprecation System
 * Handles warnings and auto-migration for deprecated primitives
 */

/**
 * Mapping of deprecated primitives to their stdlib replacements
 */
export const DEPRECATED_PRIMITIVES = {
  // Identity & Roles
  'skill': {
    migrate: 'stdlib.hire.registerSkill',
    example: 'stdlib.hire.registerSkill("name", { prompt: "..." })',
    module: 'hire'
  },
  
  // Team & Coordination
  'team': {
    migrate: 'stdlib.swarm.createTeam',
    example: 'stdlib.swarm.createTeam("name", ["agent1"], { ... })',
    module: 'swarm'
  },
  'swarm': {
    migrate: 'stdlib.swarm.createSwarm',
    example: 'stdlib.swarm.createSwarm("name", { ... })',
    module: 'swarm'
  },
  'coordinate': {
    migrate: 'stdlib.swarm.coordinate',
    example: 'stdlib.swarm.coordinate("id", "task", ["agent1"])',
    module: 'swarm'
  },
  'gestalt': {
    migrate: 'stdlib.swarm.broadcast',
    example: 'stdlib.swarm.broadcast("swarm", { message })',
    module: 'swarm'
  },
  
  // Memory & State
  'remember': {
    migrate: 'stdlib.memory.remember',
    example: 'stdlib.memory.remember("key", value, { ... })',
    module: 'memory'
  },
  'retrieve': {
    migrate: 'stdlib.memory.retrieve',
    example: 'data = stdlib.memory.retrieve("key")',
    module: 'memory'
  },
  'budget': {
    migrate: 'think timeout/max_iterations',
    example: 'think "..." { timeout: "300s", max_iterations: 5 }',
    module: 'think'
  },
  'chain': {
    migrate: 'stdlib.receipt.createChain',
    example: 'stdlib.receipt.createChain("agent_id")',
    module: 'receipt'
  },
  'plan': {
    migrate: 'think loop strategy',
    example: 'think "..." { loop: true, max_iterations: 5 }',
    module: 'think'
  },
  
  // Observation & Events
  'observe': {
    migrate: 'stdlib.witness.observe',
    example: 'stdlib.witness.observe("type", callback)',
    module: 'witness'
  },
  'witness': {
    migrate: 'stdlib.witness.logEvent',
    example: 'stdlib.witness.logEvent("type", { data })',
    module: 'witness'
  },
  'evolve': {
    migrate: 'stdlib.witness.evolve',
    example: 'stdlib.witness.evolve("type", { metadata })',
    module: 'witness'
  },
  'share': {
    migrate: 'stdlib.swarm.broadcast',
    example: 'stdlib.swarm.broadcast("swarm", { data })',
    module: 'swarm'
  },
  'heartbeat': {
    migrate: 'think loop with interval',
    example: 'think "..." { loop: true, interval: 60000 }',
    module: 'think'
  },
  
  // Tokenomics
  'wallet': {
    migrate: 'stdlib.metabolism.createWallet',
    example: 'stdlib.metabolism.createWallet("agent", 1000)',
    module: 'metabolism'
  },
  'stake': {
    migrate: 'stdlib.metabolism.stake',
    example: 'stdlib.metabolism.stake("agent", amount)',
    module: 'metabolism'
  },
  'slash': {
    migrate: 'stdlib.metabolism.slash',
    example: 'stdlib.metabolism.slash("agent", "reason")',
    module: 'metabolism'
  },
  'token': {
    migrate: 'stdlib.metabolism functions',
    example: 'stdlib.metabolism.emitDopamine("agent", amount)',
    module: 'metabolism'
  },
  'convert': {
    migrate: 'stdlib.metabolism.dopamineToSynapse',
    example: 'stdlib.metabolism.dopamineToSynapse("agent", amount)',
    module: 'metabolism'
  },
  'royalty': {
    migrate: 'stdlib.metabolism custom implementation',
    example: '// Custom royalty logic in think block',
    module: 'metabolism'
  },
  'escrow': {
    migrate: 'stdlib.metabolism custom implementation',
    example: '// Custom escrow logic in think block',
    module: 'metabolism'
  },
  'commons': {
    migrate: 'stdlib.metabolism custom implementation',
    example: '// Custom commons logic in think block',
    module: 'metabolism'
  },
  
  // Blockchain & Security
  'mint': {
    migrate: 'stdlib.metabolism.emitDopamine',
    example: 'stdlib.metabolism.emitDopamine("agent", amount)',
    module: 'metabolism'
  },
  'seal': {
    migrate: 'stdlib.receipt.seal',
    example: 'stdlib.receipt.seal(receiptId)',
    module: 'receipt'
  },
  'walrus': {
    migrate: 'stdlib.receipt + external storage',
    example: 'stdlib.receipt.createReceipt("storage", { ... })',
    module: 'receipt'
  },
  'secure': {
    migrate: 'ethics block + permission constraints',
    example: 'ethics { ... }\\npermission { ... }',
    module: 'ethics'
  },
  'sovereign': {
    migrate: 'ethics { sovereign_data: true }',
    example: 'ethics { sovereign_data: true }',
    module: 'ethics'
  },
  
  // Execution & Tools
  'pilot': {
    migrate: 'think with external tool',
    example: 'think "..." { stdlib.external.call(...) }',
    module: 'think'
  },
  'viewport': {
    migrate: 'think with vision tool',
    example: 'think "..." { stdlib.vision.analyze(...) }',
    module: 'think'
  },
  'edit': {
    migrate: 'think with edit tool',
    example: 'think "..." { stdlib.edit.file(...) }',
    module: 'think'
  },
  'bridge': {
    migrate: 'think with bridge tool',
    example: 'think "..." { stdlib.bridge.call(...) }',
    module: 'think'
  },
  'mcp': {
    migrate: 'think with MCP client',
    example: 'think "..." { stdlib.mcp.call(...) }',
    module: 'think'
  },
  
  // Integration
  'session': {
    migrate: 'think with session management',
    example: 'think "..." { stdlib.session.manage(...) }',
    module: 'think'
  },
  'policy': {
    migrate: 'permission block',
    example: 'permission { ... }',
    module: 'permission'
  },
  'analytics': {
    migrate: 'stdlib.witness.getStats',
    example: 'stdlib.witness.getStats()',
    module: 'witness'
  },
  
  // App & Meta
  'app': {
    migrate: 'think with deployment',
    example: 'think "..." { stdlib.deploy.app(...) }',
    module: 'think'
  },
  'meta-digital': {
    migrate: 'birth + identity metadata',
    example: 'birth { metadata: { ... } }',
    module: 'birth'
  },
  'public_facing': {
    migrate: 'permission { network: "public" }',
    example: 'permission { network: "public" }',
    module: 'permission'
  },
  'web_ingest': {
    migrate: 'think with fetch',
    example: 'think "..." { stdlib.fetch.url(...) }',
    module: 'think'
  },
  'filesystem': {
    migrate: 'permission { filesystem: "..." }',
    example: 'permission { filesystem: "sandbox" }',
    module: 'permission'
  },
  'neural': {
    migrate: 'think with neural routing',
    example: 'think "..." { stdlib.neural.route(...) }',
    module: 'think'
  },
  'agent': {
    migrate: 'birth + think composition',
    example: 'birth { ... }\\nthink "..." { ... }',
    module: 'birth'
  }
};

/**
 * Emit deprecation warning for a primitive
 */
export function emitDeprecationWarning(primitive, token) {
  const migration = DEPRECATED_PRIMITIVES[primitive];
  
  if (!migration) {
    console.warn(`[DEPRECATED] Unknown primitive: ${primitive}`);
    return;
  }
  
  console.warn(``);
  console.warn(`⚠️  DEPRECATED: '${primitive}' is deprecated in Swibe v4.0`);
  console.warn(`   → Migrate to: ${migration.migrate}`);
  console.warn(`   → Example: ${migration.example}`);
  console.warn(`   → See: REFACTORING_SUMMARY.md for full migration guide`);
  console.warn(``);
}

/**
 * Check if a primitive is deprecated
 */
export function isDeprecated(primitive) {
  return DEPRECATED_PRIMITIVES.hasOwnProperty(primitive);
}

/**
 * Get migration info for a primitive
 */
export function getMigrationInfo(primitive) {
  return DEPRECATED_PRIMITIVES[primitive];
}

/**
 * Get all deprecated primitives
 */
export function getAllDeprecated() {
  return Object.keys(DEPRECATED_PRIMITIVES);
}
