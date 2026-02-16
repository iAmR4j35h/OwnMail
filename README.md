# Resend Email Gateway

> The simplest way to self-host a modern email backend powered by [Resend](https://resend.com).

A lightweight, self-hostable email gateway that uses Resend as delivery infrastructure. Send and receive email through a clean REST API, store messages locally, and manage everything from a minimal dashboard. No Postfix. No IP warmup. No spam reputation headaches.

## What This Is

- A REST API for sending email via Resend
- A webhook receiver for inbound email
- Local inbox storage (SQLite by default)
- A minimal web dashboard
- Docker-first deployment

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

- Dashboard: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:8080](http://localhost:8080)

### 5. Send your first email

```bash
curl -X POST http://localhost:8080/api/send \
  -H "Authorization: Bearer your-secret-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "hello@example.com",
    "to": "user@gmail.com",
    "subject": "Hello from Resend Gateway",
    "text": "It works!"
  }'
```

## API Reference

| Method | Endpoint             | Auth           | Description                |
| ------ | -------------------- | -------------- | -------------------------- |
| POST   | `/api/send`          | Bearer token   | Send email via Resend      |
| POST   | `/api/webhook`       | Svix signature | Receive inbound email      |
| GET    | `/api/inbox`         | Bearer token   | List emails (paginated)    |
| GET    | `/api/inbox/:id`     | Bearer token   | Get single email           |
| DELETE | `/api/inbox/:id`     | Bearer token   | Delete email               |
| GET    | `/api/health`        | None           | Health check               |
| GET    | `/api/config/status` | Bearer token   | Domain & config status     |

## Architecture

```
User -> REST API -> Fastify Server -> Resend API
Resend -> Webhook -> Fastify Server -> SQLite -> Dashboard
```

### Project Structure

```
resend-emails/
├── apps/
│   ├── server/          # Fastify API + webhook listener
│   └── dashboard/       # Next.js inbox UI
├── packages/
│   ├── storage/         # Storage adapter (SQLite, Postgres stub)
│   ├── types/           # Shared TypeScript types + Zod schemas
│   └── tsconfig/        # Shared TS configscom
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
