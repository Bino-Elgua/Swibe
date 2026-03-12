# Swibe: Agent-Native Scripting

**Birth, secure, and heal full applications with one sentence.**

Swibe is an AI-native language where autonomous apps and swarms are first-class citizens. It allows agents to architect, build, deploy, and self-heal entire applications autonomously within secure sandboxes.

## Features

-   **App Primitive**: Declare full applications with `app { ... }`.
-   **Swarm Orchestration**: Multi-agent pipelines (Architect, Builder, Tagger, Guard, etc.).
-   **Autonomous Loops**: Self-healing via `loop until goal: "..."`.
-   **Secure Sandbox**: Privacy-first execution with `secure { ... }`.
-   **Persistent RAG**: Long-term memory for apps and agents.
-   **Multi-Target**: Compiles to 18 targets (JS, Python, Rust, Go, Move, etc.).
-   **Self-Healing**: Applications that monitor logs and auto-patch bugs in the dark.

## Installation

```bash
npm i -g @bino-elgua/swibe
```

## Usage

Run a Swibe script:
```bash
swibe run examples/todo-app.swibe
```

## Example: World Genesis (`family-album.swibe`)

A private family photo album born from a single vision. It features auto-tagging, encrypted storage, and an autonomous self-healing loop.

```swibe
skill VisionTagger {
  prompt: "Analyze image and generate tags: people, place, date, mood"
  tools: ["image_reader", "vision_model"]
}

skill PrivacyGuard {
  secure {
    encrypt_storage()
    no_external_upload()
  }
}

app {
  type: "photo-album",
  need: "private family photo album with auto-tagging. local-first, encrypted.",
  platform: "web"
}

swarm {
  architect: "Design UI + backend" =>
  builder: "Generate code + encryption" =>
  tagger: VisionTagger =>
  guard: PrivacyGuard =>
  healer: "Monitor and auto-patch" =>
  runner: "Deploy and return URL"
}
```

## Core Philosophies

-   **Vibe First**: Natural language prompts are valid syntax.
-   **AI Native**: LLM calls and RAG queries are built-in.
-   **Safe by Default**: Memory safety and secure execution blocks.
-   **Genesis Release**: The threshold where the tool becomes the parent.

---
🪞👁️🌓🌀📸  
**ÈMI NI BÍNÒ ÈL GUÀ**  
ÀṢẸ
