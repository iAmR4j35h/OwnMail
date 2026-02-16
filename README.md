# OwnMail

> The simplest way to self-host a modern email client powered by [Resend](https://resend.com).

A lightweight, self-hostable email platform that uses Resend as delivery infrastructure. Compose, send, and receive email through a clean web interface with full attachment support, local inbox storage, and a REST API for automation. No Postfix. No IP warmup. No spam reputation headaches.

## Features

- **Compose & Send** — Full compose UI with rich text (HTML) support, file attachments, and reply-to
- **Receive & Read** — Inbound email via Resend webhooks with full body and attachment rendering
- **Inbox Dashboard** — Browse, search, and manage your emails from a modern Next.js interface
- **Attachment Support** — Upload attachments when composing; download attachments from received emails
- **Local Storage** — All emails stored locally in SQLite (Postgres support planned)
- **REST API** — Programmatic access for sending, listing, and managing emails
- **Docker-First** — One command deployment with Docker Compose

## What This Is NOT

- A full mail server (no SMTP, no IMAP — yet)
- A Gmail/Outlook replacement
- An enterprise mail platform

## Quick Start (10 minutes)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A [Resend](https://resend.com) account (free tier works)
- A domain you control

### 1. Clone and configure

```bash
git clone https://github.com/iAmR4j35h/OwnMail.git
cd OwnMail
cp .env.example .env
```

### 2. Set up Resend

1. Create an account at [resend.com](https://resend.com)
2. Add your domain in the Resend dashboard
3. Configure DNS records (SPF, DKIM, MX) — see [DNS Guide](docs/dns-guide.md)
4. Create an API key
5. Set up a webhook pointing to `https://your-server.com/api/webhook`

### 3. Edit your .env file

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
DOMAIN=example.com
WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_KEY=your-secret-api-key-here
```

### 4. Run

```bash
docker compose up -d
```

- **Dashboard:** [http://localhost:3000](http://localhost:3000) — compose, read, and manage your email
- **API:** [http://localhost:8080](http://localhost:8080) — programmatic access

### 5. Send your first email

Open the dashboard at [http://localhost:3000/compose](http://localhost:3000/compose) and compose your first email — with attachments if you like.

Or use the API:

```bash
curl -X POST http://localhost:8080/api/send \
  -H "Authorization: Bearer your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@example.com",
    "to": "user@gmail.com",
    "subject": "Hello from OwnMail",
    "text": "It works!"
  }'
```

## Dashboard

The web dashboard provides a full email experience:

| Page | Description |
|------|-------------|
| **Inbox** | View all sent and received emails with pagination |
| **Compose** | Write and send emails with HTML support and file attachments |
| **Email View** | Read full email content, view headers, and download attachments |
| **Config** | Check domain verification status and system configuration |

## API Reference

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/send` | Bearer token | Send email (with optional attachments) |
| POST | `/api/webhook` | Svix signature | Receive inbound email |
| GET | `/api/inbox` | Bearer token | List emails (paginated) |
| GET | `/api/inbox/:id` | Bearer token | Get single email with full content |
| GET | `/api/inbox/:id/attachments/:attachmentId` | Bearer token | Download an attachment |
| DELETE | `/api/inbox/:id` | Bearer token | Delete email |
| GET | `/api/health` | None | Health check |
| GET | `/api/config/status` | Bearer token | Domain & config status |

## Architecture

```
User -> Dashboard (Next.js) -> API Server (Fastify) -> Resend API
Resend -> Webhook -> API Server -> Fetch Full Email -> SQLite -> Dashboard
```

### Project Structure

```
OwnMail/
├── apps/
│   ├── server/          # Fastify API + webhook listener
│   └── dashboard/       # Next.js web interface (inbox, compose, config)
├── packages/
│   ├── storage/         # Storage adapter (SQLite, Postgres stub)
│   ├── types/           # Shared TypeScript types + Zod schemas
│   └── tsconfig/        # Shared TS configs
├── docker/              # Dockerfiles
├── docs/                # Documentation
└── docker-compose.yml
```

## Local Development

```bash
# Install dependencies
pnpm install

# Run both server and dashboard in dev mode
pnpm dev

# Build everything
pnpm build

# Type check
pnpm typecheck
```

## Documentation

- [Setup Guide](docs/setup.md) — Detailed setup walkthrough
- [DNS Configuration](docs/dns-guide.md) — SPF, DKIM, MX setup
- [Security](docs/security.md) — Threat model and best practices

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[Apache 2.0](LICENSE)
