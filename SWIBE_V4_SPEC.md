# Swibe v4.0 Language Specification
## 5-Primitive Clean System with Modular Stdlib

**Status:** v4.0.0  
**Date:** April 22, 2026  
**Previous:** v3.4.0 (33+ primitives)

---

## Table of Contents
1. [Overview](#overview)
2. [5 Core Primitives](#core-primitives)
3. [Stdlib Modules](#stdlib-modules)
4. [Examples](#examples)
5. [Migration Guide](#migration-guide)
6. [Architecture](#architecture)

---

## Overview

Swibe v4.0 is a complete redesign of the agent-native language around **5 clean primitives**:

- **`birth`** — Agent identity & genesis
- **`think`** — Natural language reasoning loop
- **`ethics`** — Governance constraints
- **`permission`** — Access control
- **`receipt`** — Audit & proofs

All other functionality is available through **7 standard library modules** that can be intelligently composed within `think` blocks.

### Why This Design?

✅ **Clarity** — 5 keywords vs 33+  
✅ **Modularity** — Each stdlib handles one domain  
✅ **Composability** — Mix & match stdlib functions  
✅ **Extensibility** — Easy to add new stdlib modules  
✅ **Standards** — Follows clean code principles  
✅ **Power** — All old functionality available  

---

## Core Primitives

### 1. Birth — Agent Genesis

```swibe
birth {
  agent_id: "sovereign-001",
  name: "Architect",
  role: "designer",
  mnemonic: "esu-gate alpha sango-volt beta...",  -- Optional, auto-generated if omitted
  metadata: { domain: "architecture", tier: "senior" }
}
```

**Purpose:** Create and initialize an agent identity using BIPỌ̀N39.

**Fields:**
- `agent_id` (string, required) — Unique agent identifier
- `name` (string) — Human-readable name
- `role` (string) — Agent's primary role/archetype
- `mnemonic` (string) — BIP39-like mnemonic for identity (optional)
- `metadata` (object) — Additional context

**Returns:** Agent identity with cryptographic keys.

---

### 2. Think — Natural Language Reasoning

```swibe
think "Analyze the codebase and suggest optimizations" {
  max_iterations: 5,
  loop: true,
  timeout: "300s",
  
  -- Can use any stdlib functions
  stdlib.memory.remember("context", data),
  stdlib.swarm.createTeam("Team", ["agent-1"]),
  stdlib.hire.registerSkill("analyze", { ... }),
  stdlib.metabolism.emitDopamine("agent-1", 10)
}
```

**Purpose:** Main agent reasoning loop with natural language interface.

**Properties:**
- **Prompt** (string) — What the agent should think about
- **max_iterations** (number) — Max reasoning iterations (default: 5)
- **loop** (boolean) — Keep looping until complete? (default: false)
- **timeout** (string or number) — Max time in seconds (default: 300)
- **Body** — Stdlib function calls to achieve the goal

**Usage:**
```swibe
-- Simple reasoning
think "Generate a report" {
  max_iterations: 3
}

-- Complex multi-step task with stdlib
think "Hire team and execute analysis" {
  stdlib.swarm.createTeam("TeamA", agents),
  stdlib.hire.hireAgent("agent-1", "Run analysis"),
  stdlib.witness.logEvent("analysis_started"),
  stdlib.metabolism.emitDopamine("agent-1", 50)
}
```

---

### 3. Ethics — Governance Constraints

```swibe
ethics {
  harm_none: true,
  transparency: "full",
  data_ownership: "user",
  sovereign_data: true,
  
  forbidden: [
    "external_upload",
    "credential_sharing",
    "unauthorized_fork"
  ],
  
  values: {
    respect_autonomy: true,
    fair_compensation: true
  }
}
```

**Purpose:** Define agent's core values and non-negotiable constraints.

**Common Fields:**
- `harm_none` — Never cause harm
- `transparency` — Level of disclosure
- `data_ownership` — Who owns created data
- `sovereign_data` — Keep data private to agent
- `forbidden` — Actions agent will never take
- `values` — Core principles

**No computation happens here** — purely declarative.

---

### 4. Permission — Access Control Matrix

```swibe
permission {
  think: "auto",                -- Auto-approve reasoning
  bash: "simulate",             -- Simulate, don't execute
  mint: "ask",                  -- Ask before creating tokens
  edit: "sandbox",              -- Only in sandbox
  network: "restricted",        -- No external calls
  filesystem: "sandbox",        -- Limited filesystem access
  
  llm_routing: "ethics_only",   -- Check ethics first
  receipt_sealing: "on",        -- Seal all proofs
  strict: true
}
```

**Purpose:** Define what the agent is permitted to do.

**Levels:**
- `"auto"` — Automatically approved
- `"ask"` — Ask user first
- `"simulate"` — Simulate without actual execution
- `"sandbox"` — Restricted environment
- `"refuse"` — Always deny
- `"restricted"` — Limited permissions

---

### 5. Receipt — Audit Trail & Proofs

```swibe
receipt {
  log_all: true,
  seal: true,
  merkle_proof: true,
  retention: "permanent",
  
  metadata: {
    agent: "sovereign-001",
    task: "analysis",
    chain: "Dopamine-Synapse"
  }
}
```

**Purpose:** Create immutable record of all agent actions.

**Fields:**
- `log_all` — Log every action
- `seal` — Cryptographically seal records
- `merkle_proof` — Generate merkle proofs for chain
- `retention` — How long to keep ("permanent" or duration)
- `metadata` — Context for receipts

**Receipts are automatically created for:**
- Birth events
- Ethical violations detected
- Token transactions
- State changes
- Think completions

---

## Stdlib Modules

The standard library provides all the functionality that was previously built into primitives.

### stdlib/identity

Manage agent identities with BIPỌ̀N39.

```swibe
-- Create identity
identity := stdlib.identity.createIdentity(nil, "analyst")

-- Register custom role
stdlib.identity.registerRole("supervisor", {
  permissions: ["hire", "approve", "slash"],
  capabilities: ["code_review", "team_lead"],
  tier: "senior"
})

-- Assign role to agent
stdlib.identity.assignRole(agentId, "supervisor")

-- Create namespace (team/collective)
stdlib.identity.createNamespace("Architects", ["a1", "a2", "a3"])

-- Get agent info
agent := stdlib.identity.getIdentity("agent-1")
```

---

### stdlib/metabolism

Handle tokenomics (Dopamine, Synapse, staking, slashing).

```swibe
-- Create wallet
stdlib.metabolism.createWallet("agent-1", 1000)

-- Emit dopamine (reward)
stdlib.metabolism.emitDopamine("agent-1", 50, "task_completed")

-- Stake dopamine to earn synapse
stdlib.metabolism.stake("agent-1", 100)

-- Unstake and collect interest
{ wallet, interest } := stdlib.metabolism.unstake("agent-1")

-- Convert dopamine to synapse
stdlib.metabolism.dopamineToSynapse("agent-1", 50)

-- Slash for violation
result := stdlib.metabolism.slash("agent-1", "ethical_violation")

-- Get balance
balance := stdlib.metabolism.getBalance("agent-1")
-- Returns: { dopamine: 900, synapse: 50, staked: 0, total: 950 }

-- Get transaction history
history := stdlib.metabolism.getHistory("agent-1", 50)
```

---

### stdlib/witness

Event logging and observation.

```swibe
-- Log event
event := stdlib.witness.logEvent("task_started", {
  task: "analysis",
  priority: "high"
}, "agent-1")

-- Observe events of type
stdlib.witness.observe("task_started", fn(event) {
  println("Task started:", event.data)
})

-- Get filtered events
events := stdlib.witness.getEvents({
  type: "task_started",
  agent: "agent-1",
  since: timestamp,
  limit: 100
})

-- Get witness proof
witness := stdlib.witness.getWitness(eventId)

-- Trigger evolution event
stdlib.witness.evolve("level_up", { level: 3 })

-- Get statistics
stats := stdlib.witness.getStats()
```

---

### stdlib/memory

Storage and retrieval system.

```swibe
-- Remember a fact
stdlib.memory.remember("codebase_context", {
  repo: "https://github.com/...",
  lang: "rust",
  size_mb: 500
}, {
  type: "context",
  importance: "critical",
  tags: ["repo", "analysis"],
  ttl: 86400000  -- 24 hours
})

-- Retrieve value
context := stdlib.memory.retrieve("codebase_context")

-- Search by tag
contexts := stdlib.memory.searchByTag("analysis")

-- Search with criteria
results := stdlib.memory.search({
  type: "context",
  importance: "critical",
  tags: ["security"]
})

-- Forget a memory
stdlib.memory.forget("codebase_context")

-- Clear expired memories
stdlib.memory.clearExpired()

-- Get memory stats
stats := stdlib.memory.getStats()
```

---

### stdlib/swarm

Team coordination and swarming.

```swibe
-- Create a swarm
swarm := stdlib.swarm.createSwarm("AnalyzerSwarm", {
  leader: "agent-1",
  consensus: "majority",
  sync: "async"
})

-- Add agent to swarm
stdlib.swarm.addToSwarm("AnalyzerSwarm", "agent-2", {
  name: "reviewer",
  permissions: ["comment", "suggest"]
})

-- Create team
team := stdlib.swarm.createTeam("DevTeam", ["a1", "a2"], {
  architect: "design",
  coder: "implement"
})

-- Coordinate distributed task
coord := stdlib.swarm.coordinate("coord-001", "Analyze all files", ["a1", "a2"])

-- Update coordination
stdlib.swarm.updateCoordination("coord-001", "a1", {
  files_checked: 45,
  issues_found: 3
})

-- Finalize coordination
stdlib.swarm.finalizeCoordination("coord-001")

-- Broadcast message
stdlib.swarm.broadcast("AnalyzerSwarm", {
  type: "status_update",
  message: "Analysis 50% complete"
})

-- Get status
status := stdlib.swarm.getSwarmStatus("AnalyzerSwarm")
```

---

### stdlib/hire

Skill registration and agent delegation.

```swibe
-- Register a skill
stdlib.hire.registerSkill("code_review", {
  description: "Review code for quality",
  prompt: "Review this code and provide feedback",
  cost: 30,
  loopUntilGoal: "all_files_reviewed"
})

-- List available skills
skills := stdlib.hire.listSkills()

-- Hire an agent for a task
hire := stdlib.hire.hireAgent("agent-1", "Review all Python files", {
  costEstimate: 100,
  maxIterations: 10
})

-- Complete hire
stdlib.hire.completeHire(hire.id)

-- Create delegation contract
contract := stdlib.hire.createContract(
  "contract-001",
  "agent-1",      -- delegator
  "agent-2",      -- delegatee
  "code_review",  -- skill
  { compensation: 50 }
)

-- Execute delegated skill
result := stdlib.hire.executeSkill("contract-001", {
  file: "main.py",
  lines: [1, 100]
})

-- Terminate contract
stdlib.hire.terminateContract("contract-001")

-- List contracts
contracts := stdlib.hire.listContracts()
```

---

### stdlib/receipt

Receipt chain and merkle proofs.

```swibe
-- Create receipt
receipt := stdlib.receipt.createReceipt("code_review", {
  files: 50,
  issues: 5
}, "agent-1")

-- Create transaction receipt
tx_receipt := stdlib.receipt.transact("dopamine_emit", {
  amount: 100,
  reason: "task_completed"
}, "agent-1")

-- Seal receipt (finalize)
stdlib.receipt.seal(receipt.id)

-- Get merkle proof
proof := stdlib.receipt.merkleProof(receipt.id)
-- Returns: { receiptId, index, path: [...], root }

-- Create chain for agent
chain := stdlib.receipt.createChain("agent-1")

-- Add receipt to chain
stdlib.receipt.addToChain("agent-1", receipt.id)

-- Get agent's receipt chain
agentChain := stdlib.receipt.getChain("agent-1")

-- Verify receipt
verification := stdlib.receipt.verify(receipt.id)
-- Returns: { valid: true/false, originalHash, computedHash, sealed }

-- Get all receipts with filter
receipts := stdlib.receipt.getAllReceipts({
  agent: "agent-1",
  type: "transaction",
  since: timestamp,
  limit: 100
})

-- Get statistics
stats := stdlib.receipt.getStats()
```

---

## Examples

### Example 1: Simple Agent Analysis

```swibe
import stdlib from "stdlib"

birth {
  agent_id: "analyzer-001",
  name: "CodeAnalyzer",
  role: "analyst"
}

ethics {
  harm_none: true,
  transparency: "full"
}

permission {
  think: "auto",
  bash: "simulate"
}

think "Analyze repository structure" {
  stdlib.memory.remember("repo_data", {
    files: 1500,
    size: "250MB"
  }),
  stdlib.witness.logEvent("analysis_started")
}

receipt {
  log_all: true
}
```

### Example 2: Team Coordination

```swibe
think "Organize code review team" {
  -- Create team
  stdlib.swarm.createTeam("ReviewTeam", ["a1", "a2", "a3"], {
    architect: "lead_reviewer",
    coder: "secondary_reviewer"
  }),
  
  -- Register review skill
  stdlib.hire.registerSkill("code_review", {
    prompt: "Review code quality and security",
    cost: 25
  }),
  
  -- Hire reviewers
  stdlib.hire.hireAgent("a1", "Review frontend code", { maxIterations: 5 }),
  stdlib.hire.hireAgent("a2", "Review backend code", { maxIterations: 5 }),
  
  -- Emit dopamine for participation
  stdlib.metabolism.emitDopamine("a1", 50, "review_started"),
  stdlib.metabolism.emitDopamine("a2", 50, "review_started"),
  
  -- Log coordination
  stdlib.witness.logEvent("team_review_started", { size: 3 })
}
```

### Example 3: Tokenomics & Staking

```swibe
think "Manage agent rewards and staking" {
  -- Create wallets
  stdlib.metabolism.createWallet("agent-1", 5000),
  stdlib.metabolism.createWallet("agent-2", 3000),
  
  -- Emit rewards
  stdlib.metabolism.emitDopamine("agent-1", 500, "month_salary"),
  stdlib.metabolism.emitDopamine("agent-2", 300, "month_salary"),
  
  -- Agent-1 stakes for passive income
  stdlib.metabolism.stake("agent-1", 1000),
  
  -- Agent-2 converts to synapse
  stdlib.metabolism.dopamineToSynapse("agent-2", 500),
  
  -- Check balances
  balance1 := stdlib.metabolism.getBalance("agent-1"),
  balance2 := stdlib.metabolism.getBalance("agent-2"),
  
  -- Log financial activity
  stdlib.witness.logEvent("financial_cycle", {
    dopamine_emitted: 800,
    synapse_created: 50
  })
}
```

---

## Migration Guide

### Step 1: Update Imports

```swibe
-- Add at top of file
import stdlib from "stdlib"
```

### Step 2: Keep 5 Primitives

Keep `birth`, `ethics`, `permission`, `think`, `receipt` as-is (they don't change).

### Step 3: Migrate Actions to Think

Move all old primitive calls into `think` blocks using stdlib:

#### skill → stdlib.hire

```swibe
-- OLD
skill {
  prompt: "Analyze code"
}

-- NEW
think "..." {
  stdlib.hire.registerSkill("analyze", {
    prompt: "Analyze code"
  })
}
```

#### team → stdlib.swarm

```swibe
-- OLD
team "Dev" { coder: "implement" }

-- NEW
think "..." {
  stdlib.swarm.createTeam("Dev", members, {
    coder: "implement"
  })
}
```

#### remember/retrieve → stdlib.memory

```swibe
-- OLD
remember { "key": "value" }
data := retrieve("key")

-- NEW
think "..." {
  stdlib.memory.remember("key", "value"),
  data := stdlib.memory.retrieve("key")
}
```

#### witness/observe → stdlib.witness

```swibe
-- OLD
observe("task_done")

-- NEW
think "..." {
  stdlib.witness.logEvent("task_done")
}
```

#### wallet/stake/slash → stdlib.metabolism

```swibe
-- OLD
wallet { agent: "a1", balance: 1000 }
stake { amount: 100 }

-- NEW
think "..." {
  stdlib.metabolism.createWallet("a1", 1000),
  stdlib.metabolism.stake("a1", 100)
}
```

---

## Architecture

### Layer Structure

```
┌─────────────────────────────────────────┐
│        SWIBE v4.0 Architecture          │
├─────────────────────────────────────────┤
│                                         │
│  5 CORE PRIMITIVES (Language Layer)    │
│  ─────────────────────────────────────  │
│   birth | think | ethics | permission  │
│              | receipt                  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  7 STDLIB MODULES (Library Layer)      │
│  ─────────────────────────────────────  │
│  identity | metabolism | witness       │
│  memory | swarm | hire | receipt       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  RUNTIME (Execution Layer)              │
│  ─────────────────────────────────────  │
│  Lexer | Parser | Compiler | VM        │
│  Multi-target backends (44 langs)      │
│                                         │
└─────────────────────────────────────────┘
```

### Execution Flow

```
1. Parse → Build AST of 5 primitives + stdlib calls
2. Validate → Check ethics & permissions
3. Allocate → Prepare memory & token budgets
4. Execute → Run think loop with stdlib
5. Log → Create receipts & witness events
6. Verify → Seal receipts & generate proofs
```

---

## Compatibility

- ✅ All v3.4 functionality available
- ⚠️  Direct primitive syntax changed (use stdlib)
- ✅ REPL works with new syntax
- ✅ All 44 compilation targets supported
- ✅ BIPỌ̀N39 identity unchanged
- ✅ Tokenomics (Dopamine/Synapse) unchanged

---

## Performance

- **Cleaner parsing** — Fewer keywords
- **Better modularity** — stdlib can be optimized independently
- **Reduced cognitive load** — Simple interface
- **Extensible** — Add stdlib modules without core changes

---

## Contact & Support

- **Documentation:** `REFACTORING_SUMMARY.md`
- **Examples:** `examples/v4-5-primitives-example.swibe`
- **Migration:** `migrate.sh`

---

**Swibe v4.0** — Clean, modular, powerful agent scripting.
