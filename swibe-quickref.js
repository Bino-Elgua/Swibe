#!/usr/bin/env node

/**
 * Swibe v4.0 - 5-Primitive Quick Reference
 * Interactive guide for the new system
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const content = {
  main: `
╔════════════════════════════════════════════════════════════════╗
║          SWIBE v4.0 - 5-Primitive System                      ║
║          Clean, Modular, Agent-Native Scripting               ║
╚════════════════════════════════════════════════════════════════╝

QUICK REFERENCE
===============

5 Core Primitives:
  1. birth       - Agent genesis & identity
  2. think       - Natural language reasoning loop
  3. ethics      - Governance constraints
  4. permission  - Access control matrix
  5. receipt     - Audit trail & proofs

7 Stdlib Modules:
  1. stdlib.identity   - BIPỌ̀N39, roles
  2. stdlib.metabolism - Dopamine, Synapse, tokenomics
  3. stdlib.witness    - Event logging
  4. stdlib.memory     - Storage & retrieval
  5. stdlib.swarm      - Team coordination
  6. stdlib.hire       - Skill delegation
  7. stdlib.receipt    - Receipt chains

Commands:
  swibe run <file.swibe>              - Execute agent
  swibe compile <file> --target <lang> - Compile to language
  swibe repl                          - Interactive shell
  swibe init                          - Start new project
  swibe debug <file>                  - Debug mode

Files:
  SWIBE_V4_SPEC.md       - Full language specification
  REFACTORING_SUMMARY.md - What changed from v3.4
  examples/v4-*.swibe    - Example code
  migrate.sh            - Migration tool

Choose a topic:
  [1] View quick example
  [2] Primitive reference
  [3] Stdlib overview
  [4] Migration help
  [5] Exit

Enter choice (1-5): 
`,

  example: `
Example: Security Analysis Agent
=================================

import stdlib from "stdlib"

birth {
  agent_id: "security-001",
  name: "SecurityAnalyzer",
  role: "security_expert"
}

ethics {
  harm_none: true,
  transparency: "full"
}

permission {
  think: "auto",
  bash: "simulate"
}

think "Analyze codebase for vulnerabilities" {
  stdlib.memory.remember("scan_started", Date.now()),
  stdlib.swarm.createTeam("SecurityTeam", ["security-001"]),
  stdlib.hire.registerSkill("vulnerability_scan", {
    prompt: "Find security issues"
  }),
  stdlib.metabolism.emitDopamine("security-001", 100),
  stdlib.witness.logEvent("scan_complete")
}

receipt {
  log_all: true,
  seal: true
}
`,

  primitives: `
5 Core Primitives Reference
============================

1. BIRTH - Agent Genesis
   birth {
     agent_id: "agent-1",
     name: "MyAgent",
     role: "analyst",
     mnemonic: "...",
     metadata: { ... }
   }
   → Creates agent with BIPỌ̀N39 identity

2. THINK - Reasoning Loop
   think "Do something" {
     max_iterations: 5,
     loop: true,
     timeout: "300s",
     stdlib.memory.remember(...),
     stdlib.swarm.createTeam(...)
   }
   → Main agent computation

3. ETHICS - Values & Constraints
   ethics {
     harm_none: true,
     transparency: "full",
     sovereign_data: true,
     forbidden: ["..."]
   }
   → Declarative values only

4. PERMISSION - Access Control
   permission {
     think: "auto",
     bash: "simulate",
     mint: "ask",
     filesystem: "sandbox"
   }
   → What agent can do

5. RECEIPT - Audit Trail
   receipt {
     log_all: true,
     seal: true,
     merkle_proof: true,
     retention: "permanent"
   }
   → Immutable record of actions
`,

  stdlib: `
7 Stdlib Modules Overview
==========================

1. stdlib.identity
   - createIdentity(mnemonic, role)
   - registerRole(name, config)
   - assignRole(agentId, role)
   - createNamespace(name, members)

2. stdlib.metabolism
   - createWallet(agentId, balance)
   - emitDopamine(agentId, amount, reason)
   - stake(agentId, amount)
   - unstake(agentId)
   - getBalance(agentId)

3. stdlib.witness
   - logEvent(type, data, agent)
   - observe(type, callback)
   - getEvents(filter)
   - evolve(type, metadata)

4. stdlib.memory
   - remember(key, value, metadata)
   - retrieve(key)
   - search(criteria)
   - searchByTag(tag)
   - forget(key)

5. stdlib.swarm
   - createSwarm(name, config)
   - addToSwarm(swarmName, agentId, role)
   - createTeam(name, members, config)
   - coordinate(id, task, agents)
   - broadcast(swarmName, message)

6. stdlib.hire
   - registerSkill(name, config)
   - hireAgent(agentId, task, config)
   - createContract(id, delegator, delegatee, skill, terms)
   - executeSkill(contractId, input)

7. stdlib.receipt
   - createReceipt(type, data, agent)
   - transact(type, data, agent)
   - seal(receiptId)
   - merkleProof(receiptId)
   - createChain(agentId)
   - verify(receiptId)
`,

  migration: `
Migration from v3.4 → v4.0
===========================

KEEP (unchanged):
  birth { ... }
  ethics { ... }
  permission { ... }
  receipt { ... }
  import stdlib from "stdlib"

MOVE TO think BLOCK (use stdlib):
  OLD: skill { ... }
  NEW: think "..." { stdlib.hire.registerSkill(...) }

  OLD: team "X" { ... }
  NEW: think "..." { stdlib.swarm.createTeam("X", ...) }

  OLD: remember { "k": "v" }
  NEW: think "..." { stdlib.memory.remember("k", "v") }

  OLD: wallet { ... }
  NEW: think "..." { stdlib.metabolism.createWallet(...) }

  OLD: witness { ... }
  NEW: think "..." { stdlib.witness.logEvent(...) }

  OLD: observe("type")
  NEW: think "..." { stdlib.witness.observe("type", fn(...)) }

  OLD: stake { amount: 100 }
  NEW: think "..." { stdlib.metabolism.stake(...) }

REMOVE (deprecated):
  secure {} → put constraints in ethics{}
  budget {} → use think's native timeout/iterations
  swarm {} → use stdlib.swarm.createSwarm()
  chain {} → use stdlib.receipt
  plan {} → use think's loop: true
  +18 others → see REFACTORING_SUMMARY.md

See also: migrate.sh script
`,
};

function showMenu() {
  console.clear();
  console.log(content.main);
  
  rl.question('', (choice) => {
    console.clear();
    switch(choice) {
      case '1':
        console.log(content.example);
        break;
      case '2':
        console.log(content.primitives);
        break;
      case '3':
        console.log(content.stdlib);
        break;
      case '4':
        console.log(content.migration);
        break;
      case '5':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid choice. Showing help...');
    }
    
    if (choice !== '5') {
      rl.question('\nPress Enter to continue...', () => {
        showMenu();
      });
    }
  });
}

// Start
showMenu();
