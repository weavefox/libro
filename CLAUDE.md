# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Libro is a JavaScript + Python hybrid monorepo providing a Notebook product solution with AI capabilities. It supports kernel-level extensibility and defines workflows for large models.

## Development Commands

```bash
# Initial setup (installs dependencies and builds packages)
pnpm bootstrap

# Start development server (docs/demo site)
pnpm run docs

# Build all packages
pnpm run build

# Lint code
pnpm run lint

# Run all tests
pnpm run test

# Run tests for a specific package
pnpm run test:jest --filter=@difizen/libro-core

# Type check
pnpm run tsc

# Create changeset for version management
pnpm run changeset

# Run CI checks (lint, typecheck, coverage)
pnpm run ci:check
```

## Architecture

### Dependency Injection Framework

Libro uses `@difizen/mana-app` for dependency injection. Core patterns:

- **ManaModule**: Modules are created using `ManaModule.create().register(...).dependOn(...)`
- **@singleton / @transient**: Class decorators for DI scope
- **@inject**: Property/constructor injection
- **@prop()**: Reactive properties with MobX-like behavior
- **Contributions**: Use `.contribution(Token)` to register providers, then inject `@inject(Token)` to get all contributions

### Core Package Structure (`@difizen/libro-core`)

- **LibroModule**: Main module that registers core services and depends on sub-modules
- **LibroService**: Manages notebook views/models, tracks active/focus state, emits events
- **LibroModel**: Notebook model containing cells and metadata
- **LibroView**: Notebook view component
- **LibroCellModule**: Cell system with `CellViewContribution` and `CellModelContribution` for registering cell types

### Cell System

Cells follow a contribution pattern. To add a new cell type:

1. Create `CellViewContribution` - provides the view component
2. Create `CellModelContribution` - provides factory for the model
3. Register both in your module

Existing cell types: `code-cell`, `markdown-cell`, `prompt-cell`, `sql-cell`, `raw-cell`

### Kernel Architecture (`@difizen/libro-kernel`)

- **IKernelConnection**: Interface for kernel communication
- **ExecutableNotebookModel**: Extends NotebookModel with kernel connection support
- Kernel connection is managed per notebook instance

### Key Packages

| Package                 | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| `libro-core`            | Core notebook functionality, model/view, cell system   |
| `libro-kernel`          | Kernel connection management                           |
| `libro-jupyter`         | Jupyter protocol implementation, integrates cell types |
| `libro-lab`             | Full lab application combining all features            |
| `libro-ai-native`       | AI capabilities (completion, chat, error fixing)       |
| `libro-codemirror`      | CodeMirror editor integration                          |
| `libro-cofine-editor-*` | Advanced editor features (LSP, textmate)               |
| `libro-rendermime`      | MIME type rendering for outputs                        |
| `libro-output`          | Output display components                              |

### Build System

- **pnpm** with workspaces for monorepo management
- **nx** for task orchestration with caching
- **father** for building individual packages (ESM output to `es/`)

### Version Management

- Uses **changesets** for version management
- All `@difizen/*` packages are linked together (same version)
- Run `pnpm run changeset` to create version changes

## Release Process

1. Create changeset: `pnpm run changeset` (or auto-generate for snapshots)
2. Build: `pnpm run build`
3. For snapshot release: `sh ./scripts/release-snapshot.sh`

## Commit Convention

Follow Angular commit guidelines:

- `feat(scope): description` - new feature
- `fix(scope): description` - bug fix
- `chore(scope): description` - maintenance

## Requirements

- Node.js 20.x
- pnpm 8.15.6
