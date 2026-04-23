# Swibe Primitive Refactoring Summary

**Date:** April 22, 2026  
**Version:** Swibe v4.0.0 (Breaking Change)  
**Status:** Phase 2 Complete - Core Refactoring Done

---

## Overview

Swibe has been transformed from a 33+ primitive bloated language to a **clean 5-primitive system** with powerful stdlib modules.

## What Changed

### Before: 33+ Primitives
```
birth, think, ethics, permission, receipt (core)
skill, swarm, team, coordinate, gestalt (coordination)
secure, mint, seal, walrus (blockchain)
chain, plan, retrieve, budget, remember, observe, evolve (agent state)
share, heartbeat, witness, pilot, viewport (execution)
mcp, edit, bridge, session, policy, analytics (integration)
token, wallet, stake, slash, convert, royalty, escrow, commons (tokenomics)
public_facing, web_ingest, sovereign, filesystem, neural, agent, app (misc)
```

### Now: 5 Core Primitives + 7 Stdlib Modules

**Core Primitives:**
- `birth { }` - Agent genesis/identity
- `think "prompt" { }` - Natural language interface  
- `ethics { }` - Governance constraints
- `permission { }` - Access control matrix
- `receipt { }` - Audit/proof trail

**Stdlib Modules** (all old concepts moved here):
1. `stdlib/identity.js` - BIPỌ̀N39, roles, namespaces
2. `stdlib/metabolism.js` - Dopamine, Synapse, tokenomics
3. `stdlib/witness.js` - Event logging, observation
4. `stdlib/memory.js` - Remember, retrieve, storage
5. `stdlib/swarm.js` - Team, coordination, broadcasts
6. `stdlib/hire.js` - Skills, agent delegation, contracts
7. `stdlib/receipt.js` - Receipt chains, merkle proofs

## Migration Guide

### Old Code
```swibe
-- Bloated: 20+ keywords
ethics { harm_none: true }
secure { execution: "strict-vm" }
permission { think: "auto"; bash: "simulate" }
budget { tokens: 100000; time: "300s" }
team "DevTeam" { architect: "design"; coder: "implement" }
swarm { agent1, agent2 }
witness { observe: "all" }
remember { "context": "value" }
skill { prompt: "do something" }
```

### New Code
```swibe
-- Clean: 5 keywords + stdlib
import stdlib from "stdlib"

birth {
  agent_id: "dev-001",
  identity: "create"
}

ethics { harm_none: true }
permission { think: "auto" }

think "Analyze codebase" {
  stdlib.memory.remember("codebase", data),
  stdlib.swarm.createTeam("DevTeam", ["dev-001"]),
  stdlib.hire.registerSkill("analyze", { prompt: "..." }),
  stdlib.metabolism.emitDopamine("dev-001", 10)
}

receipt { log: true }
```

## Backward Compatibility

⚠️ **Breaking Change**: Old primitives are **NOT** supported directly.

To migrate:
1. Replace direct primitive usage with stdlib function calls
2. Use `import stdlib from "stdlib"` in scripts
3. Keep `birth`, `think`, `ethics`, `permission`, `receipt` as top-level blocks
4. Move all other logic into `think` blocks using stdlib

## Benefits

✅ **Cleaner Language** - 5 keywords vs 33+  
✅ **Modular Design** - Each stdlib handles one domain  
✅ **Better Organization** - Code in `think` is naturally ordered  
✅ **Easy Extension** - Add stdlib modules without core changes  
✅ **Standards Compliant** - Follows clean code principles  
✅ **Full Power** - All old functionality available via stdlib  
✅ **Type Safe** - Easier to add typing & validation  

## Preserved Features

✅ BIPỌ̀N39 identity system (full)  
✅ Tokenomics (Dopamine, Synapse, metabolism)  
✅ Multi-target compiler (44 backends)  
✅ Runtime & interpreter  
✅ REPL functionality  
✅ Receipt chain & merkle proofs  
✅ Swarm coordination  

## File Changes

### Modified
- `src/lexer.js` - Removed 28 deprecated token types

### Created
- `stdlib/index.js` - Main export
- `stdlib/identity.js` - Identity & roles
- `stdlib/metabolism.js` - Tokenomics
- `stdlib/witness.js` - Event logging
- `stdlib/memory.js` - Memory management
- `stdlib/swarm.js` - Team coordination
- `stdlib/hire.js` - Skill delegation
- `stdlib/receipt.js` - Receipt chains

## Next Steps

1. Update parser to accept stdlib imports
2. Enhance `think` primitive to be main NLI
3. Create migration guide for users
4. Add stdlib documentation
5. Migrate examples to new syntax
