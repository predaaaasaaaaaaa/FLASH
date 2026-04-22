<div align="center">
  <img src="docs/cli-screenshot.svg" alt="FLASH CLI Demo" width="800">
  <br/>
  <h1>⚡ FLASH V2</h1>
  <p><b>The Deterministic Memory Engine for Autonomous AI Agents</b></p>
  <p>
    <i>Stop relying on probabilistic RAG. Give your Agent mathematical certainty about your codebase.</i>
  </p>
</div>

---

## 🧠 The Philosophy: Beyond RAG

In the era of AI-assisted engineering (2026), the bottleneck is no longer code generation—it's **Information Poisoning**. 

When an AI Agent relies on standard Vector Retrieval (RAG), it guesses how your codebase fits together based on semantic similarity. It hallucinates dependencies, misses inherited methods, and completely ignores the chronological *context* of why a piece of code was written (e.g., a recent terminal error).

**FLASH** replaces probabilistic guessing with a **Deterministic Knowledge Base (DKB)**. It builds a mathematically rigid graph of your codebase using Abstract Syntax Trees (AST) and links it directly to your live terminal errors and Git history.

---

## 🏗️ Project Structure

FLASH is built with strict separation of concerns, ensuring that the "Tri-State Memory Vault" is deterministic, testable, and reliable.

```text
flash-memory/
├── bin/
│   └── flash.js           # The executable CLI entrypoint
├── src/
│   ├── cli.ts             # Main CLI routing and command registration
│   ├── wizard.ts          # The interactive, red-themed terminal UI
│   ├── orchestrator.ts    # The Synthesizer: Routes queries and formats LLM prompts
│   ├── parser.ts          # Universal Core: Multi-language Tree-Sitter registry
│   ├── graph.ts           # Deterministic Core: Mathematical dependency graph
│   ├── rules.ts           # Architectural Fitness Functions: Enforces dependency boundaries
│   ├── fix.ts             # Closed-Loop Auto-Fixer: AI resolution with AST Sandbox verification
│   ├── sandbox.ts         # AST Sandbox: Verifies proposed code before applying
│   ├── chronicle.ts       # Telepathic Timeline: Tracks local and linked cross-repo events
│   ├── interceptor.ts     # Terminal Interceptor: Securely catches stdout/stderr
│   ├── git-sync.ts        # Git Auto-Correlation: Maps commits to terminal errors
│   ├── vector.ts          # Graph-RAG Semantic Layer: Local Transformers.js embeddings
│   ├── scanner.ts         # Live Workspace Scanner: Recursively indexes the project
│   ├── config.ts          # Secure local configuration manager (~/.flash_config.json)
│   └── llm.ts             # Zero-dependency LLM Client (Gemini & OpenAI)
├── tests/                 # 100% Test-Driven isolated test suites
└── docs/                  # Assets and screenshots
```

### The Three Pillars of V2

1. **The Universal Core (Multi-Language Graph):** Dynamically loads `tree-sitter` grammars for TypeScript, Python, Go, Rust, and Java. It knows *exactly* where a class is defined across your polyglot microservices.
2. **The Telepathic Engine (Timeline):** Tracks the lifecycle of bugs. It intercepts terminal failures and correlates them to Git commits. **V2 Telepathy** links multiple repositories, instantly finding API contract breaches when a dependency changes upstream.
3. **Local Graph-RAG (Synthesizer):** Uses local HuggingFace embeddings (`all-MiniLM-L6-v2`) via `transformers.js` to run semantic search *purely locally*. It searches semantics, but uses the Deterministic Graph to extract mathematically proven AST bounds.

---

## 🚀 Getting Started

### Installation

Requires Node.js >= 18. Install globally to access the `flash` command from any workspace.

```bash
npm install -g flash-memory
```

### First-Run Configuration

Navigate to your project directory and initialize FLASH:

```bash
cd my-project/
flash wizard
```

On the first run, the interactive CLI will ask you to select your preferred AI provider (Google Gemini or OpenAI) and securely store your API key in `~/.flash_config.json`.

---

## 💻 Core Workflows

FLASH provides a suite of commands designed for zero-friction integration into your daily workflow.

### 1. The Interactive Wizard
For a guided, visual experience, launch the main interface. FLASH will scan your directory, build the deterministic graph, and allow you to ask complex questions.

```bash
flash wizard
```

### 2. The Closed-Loop Auto-Fixer
When an error occurs, simply run `flash fix`. FLASH will query the LLM for a solution, apply it in a secret AST memory sandbox, run `tree-sitter` to verify it mathematically parses without syntax errors, and *only then* write the fix to your disk.

```bash
flash fix
```

### 3. Architectural Fitness Functions
Define strict dependency boundaries in `.flash_rules.json` (e.g., "UI cannot import DB"). Run `flash verify` in your CI/CD pipeline to mathematically block architectural regressions without heavy compilation.

```bash
flash verify
```

### 4. The Terminal Interceptor & Git Auto-Correlation
Stop copy-pasting errors. Run your standard dev commands through the FLASH interceptor. If it fails, FLASH memorizes it. Run `flash sync-git` to map recent commits to the timeline.

```bash
flash run npx tsc --noEmit
flash sync-git
```

### 5. Zero-Friction Upgrades
Stay up to date with the latest features without fighting package managers.

```bash
flash update
```

---

## 🛡️ Security & Privacy

*   **Local First:** Your codebase is parsed and indexed entirely on your local machine inside a `.flash/` directory. Source code is *never* sent to the cloud unless specifically included in the synthesized context sent to your configured LLM.
*   **Secure Interceptor:** The `flash run` command is built with hardened execution layers (`shell: false`) to prevent arbitrary command injection.
*   **Key Management:** API keys are stored outside your project directory in your user home folder to prevent accidental commits.

<br/>
<div align="center">
  <i>FLASH - Engineering absolute truth for Autonomous Systems.</i>
</div>