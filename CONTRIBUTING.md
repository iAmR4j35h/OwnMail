# Contributing to OwnMail

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (optional, for testing containers)

### Local Setup

```bash
# Clone the repo
git clone https://github.com/iAmR4j35h/OwnMail.git
cd OwnMail

# Install dependencies
pnpm install

# Copy environment config
cp .env.example .env
# Edit .env with your Resend credentials

# Run in development mode
pnpm dev
```

### Project Structure

- `apps/server` — Fastify API server (sending, receiving, webhooks, attachments)
- `apps/dashboard` — Next.js web interface (inbox, compose, email viewer, config)
- `packages/types` — Shared TypeScript types and Zod schemas
- `packages/storage` — Storage adapter interface and implementations
- `packages/tsconfig` — Shared TypeScript configurations

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feat/add-smtp-bridge` — New features
- `fix/webhook-signature-validation` — Bug fixes
- `docs/update-dns-guide` — Documentation changes
- `refactor/storage-adapter-interface` — Code refactoring

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add SMTP bridge for local email sending
fix: correct webhook signature verification for rotated keys
docs: add troubleshooting section to DNS guide
refactor: extract email validation into shared utility
```

### Making Changes

1. Create a branch from `main`
2. Make your changes
3. Run type checking: `pnpm typecheck`
4. Run the build: `pnpm build`
5. Test your changes locally
6. Commit with a descriptive message
7. Open a pull request

### Pull Requests

- Fill out the PR template
- Reference any related issues
- Include screenshots for UI changes
- Keep PRs focused — one feature or fix per PR

## Code Guidelines

### TypeScript

- Use strict TypeScript (enabled by default)
- Prefer `interface` over `type` for object shapes
- Use Zod schemas for runtime validation
- Export types from `packages/types`

### API Routes

- Validate all input with Zod
- Return consistent response shapes (`{ success, data }` or `{ success, error }`)
- Use appropriate HTTP status codes
- Log errors server-side

### Storage Adapters

When adding a new storage adapter:

1. Implement the `IStorageAdapter` interface from `packages/storage`
2. Add the adapter to the factory function in `packages/storage/src/index.ts`
3. Document the required environment variables
4. Add the option to `.env.example`

## Reporting Issues

- Use the issue templates
- Include steps to reproduce
- Include relevant logs or error messages
- Specify your environment (OS, Docker version, Node version)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).
