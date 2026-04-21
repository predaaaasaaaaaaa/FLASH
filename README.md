<div align="center">
  
# ⚡ FLASH
**The Semantic Time Machine for AI Agents.**

<img src="docs/cli-screenshot.svg" alt="FLASH CLI Demo" width="800">

*Stop trying to teach your AI Agent how to guess codebase architecture. Give it **Deterministic Memory** instead.*

</div>

---

## The Problem: "Context Exhaustion"

If you've built AI Agents or used AI tools in 2026, you know the pain:
1. You ask your Agent to fix a bug: *"Why did the build fail?"*
2. The Agent searches standard RAG (Vector Search) and finds 15 files with the word "build". It guesses the wrong one.
3. You prompt the Agent: *"No, look at the error from the terminal."*
4. It hallucinates a fix that breaks three other files because it doesn't understand the underlying dependency graph.
5. Three hours later, you fix it yourself.

LLMs are brilliant reasoners, but they suffer from **Information Poisoning** when fed chaotic, non-deterministic text.

## The Solution (V1): "Tri-State Memory Vault"

**FLASH** is a framework that fundamentally changes how Agents remember and interact with codebases. 

Instead of forcing the LLM to guess how functions are wired together or why an error occurred, **FLASH pre-packages all of that context into a 100% deterministic, self-validating Graph and Time-Series DB.**

When an Agent uses FLASH, it doesn't hallucinate architecture. It asks the Deterministic Knowledge Base (DKB).

---

## ⚡️ For Beginners: Zero-Friction Insights

You don't need to be a Python or TypeScript expert to get 100% reliable codebase context.

1. **Run the Wizard:**
```bash
flash wizard
```
The stunning, interactive red-themed CLI will map your entire project in seconds.

2. **The Magic Output:**
FLASH instantly reads your codebase, building a perfect AST Tree-Sitter graph and outputs exactly where things are, how they connect, and what terminal errors recently caused them to fail.

3. **Deploy to your Agent:**
Run FLASH locally alongside your Agent. It acts as an active, un-hallucinating brain for any LLM.

---

## 🛠 For Pro Devs: Absolute Determinism

FLASH exposes a powerful architecture for building enterprise-grade, hallucination-free Agents.

### 1. Deterministic Core (Graph DB)
Uses `tree-sitter` to parse code into Abstract Syntax Trees. It maintains a rigid, mathematical graph of all functions and classes. LLMs will *never* guess structure again.

### 2. Chronological Engine (Time-Series)
Intercepts and logs terminal outputs, build errors, and Git commit metadata along a strict timeline. It provides the "Why" behind code changes.

### 3. Orchestrator Agent
Intelligently routes queries. If you ask "why", it queries the Timeline. If you ask "where", it queries the Graph. If it lacks context, it strictly refuses to answer rather than guessing.

---

## 🚀 V2: Autonomous Self-Indexing & Interceptors (Coming Soon)

FLASH V2 elevates the framework from an interactive CLI to an **Always-On Autonomous Observer**. 

### 1. Terminal Interceptor
FLASH will automatically intercept standard shell commands, capture their error outputs, and feed them into the Chronological Engine without you lifting a finger.

### 2. Git Auto-Correlation
FLASH will automatically analyze the `.git` folder so it can link historical error messages to the diffs of recent commits on the fly.

### 3. Neural Semantic Search
A lightweight local HuggingFace embedding model to replace standard deterministic vector mocking with real, context-aware neural semantic search.

---

## 📦 Installation & Upgrading

```bash
# Requires Node >= 18
npm install -g flash-memory
```

**Zero-Friction Updates:**
When a new version of FLASH drops, simply run:
```bash
npm update -g flash-memory
```

---

<div align="center">
  <i>Built for the next generation of autonomous systems.</i>
</div>
