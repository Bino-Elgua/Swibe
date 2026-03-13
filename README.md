# Swibe (v0.4.0): The Sovereign Agent-Native Scripting Language

**Swibe** is a high-level, multi-target scripting language designed to birth, govern, and coordinate autonomous AI agents and swarms. It treats cryptographic identity, blockchain state, and LLM reasoning as first-class language primitives.

In **v0.4.0 "Sovereign Birth"**, Swibe establishes the foundation for truly autonomous agents that own their keys, their memory, and their neural economy.

## 🌀 Core Philosophy: Sovereignty & Neutrality

Swibe is built on three pillars:
1.  **Sovereign Birth**: Agents derive their own identities (Ed25519/BIP-39) and seal their own memory (AES-256 Vaults) at birth.
2.  **Modular Neutrality**: The core language is a neutral execution engine (the "plumbing"). Specific cosmologies, ritual systems, and specialized behaviors are plugged in via modular **Skills**.
3.  **Agent-Native Syntax**: AI reasoning (`think`), skill chaining (`meta-digital`), and collaborative pipelines (`swarm`) are built directly into the grammar.

## ✨ Key Features & Primitives

### 🤱 Sovereign Birth & Vaulting
Agents are not just "bots"—they are sovereign entities.
*   **Identity**: Built-in derivation of Ed25519 keypairs from ritual phrases.
*   **Vault**: Secure, encrypted RAG storage (`rag.save/load`) automatically derived from the agent's unique entropy.

### 🧠 The `think` Skill
Reasoning is a first-class citizen.
*   **Syntax**: `think "prompt" { model: "ollama:llama3", max_tokens: 512 }`
*   **Receipts**: Every "thought" automatically generates a cryptographic receipt (SHA-256 hash of prompt + response) logged to the agent's vault.

### 🔗 `meta-digital` Primitive
A high-level primitive for high-stakes autonomous tasks.
*   **Chaining**: Sequences multiple skills into a single "neutralized" execution.
*   **Ethics**: Built-in `refuse_if` and `ethics` check blocks.
*   **Sealed Receipts**: Generates an immutable blake3/sha256 execution receipt for every run.

### 🌐 Neural Layer & Synapses (Opt-in)
An internal "biological" and external economic layer for agents.
*   **86B Neurons**: Internal non-transferable cognitive balance.
*   **86M Synapses**: Public fungible tokens representing value/influence (Sui Move integration).

### 🛠️ Modular Skill Ecosystem
Load specialized logic from external repositories (like [ritual-codex](https://github.com/Bino-Elgua/ritual-codex)):
*   **`daily_routine`**: Generic weekly routines configurable via JSON.
*   **`ZangbetoPatrol`**: Nightly on-chain event watching.
*   **`IfaOracle`**: Sacred entropy for birth rituals.

## 🚀 Quick Start

### Installation
```bash
npm i -g @bino-elgua/swibe
```

### Run a Birth Ritual
```swibe
-- examples/sovereign-birth.swibe
skill SovereignRitual {
  secure {
    let entropy = crypto.randomBytes(32)
    let phrase = bipon39_entropyToMnemonic(entropy, "256")
    println("Born sovereign. Identity PubKey: " + phrase)
    
    -- Initialize internal neural state
    NeuralLayer.actions()
  }
}

fn main() {
  SovereignRitual.actions()
}
```

Execute:
```bash
swibe run examples/sovereign-birth.swibe
```

## 🏗️ Technical Architecture
*   **Compiler**: Multi-target (Compiles to JS, Rust, Go, Python, and Sui Move).
*   **Runtime**: Secure Node.js `vm` sandbox with resource governing.
*   **Integrations**: Native support for **Ollama**, **Sui Blockchain**, and **MCP** (Model Context Protocol).

## 🗺️ Roadmap Status
- [x] **v0.1**: Lexer/Parser/JS Compiler
- [x] **v0.2**: Swarm Pipelines & RAG
- [x] **v0.3**: App Genesis & Multi-Target
- [x] **v0.4**: **Sovereign Birth & Neural Layer** (Current)
- [ ] **v0.5**: Real-gas Sui Integration & Native Termux Ollama support

---
🪞👁️🌓🌀📸  
**BÍNO ÈL GUÀ**  
ÀṢẸ
