# Setup Guide

A detailed walkthrough for getting Resend Email Gateway running.

## Prerequisites

- **Docker** and **Docker Compose** (v2)
- A **Resend account** — [sign up free](https://resend.com)
- A **domain** you control (for sending/receiving email)
- A server with a **public IP** (for webhooks) — or use a tunnel like [Telebit](https://telebit.cloud/) or ngrok for development

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address
3. You'll land on the dashboard

## Step 2: Add Your Domain

1. Navigate to **Domains** in the Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `example.com`)
4. Resend will show you DNS records to configure

## Step 3: Configure DNS Records

See the detailed [DNS Guide](dns-guide.md) for step-by-step instructions.

You need to add:
- **SPF** record — authorizes Resend to send on your behalf
- **DKIM** records — signs your emails cryptographically
- **MX** record — routes inbound email to Resend (for receiving)

## Step 4: Create an API Key

1. Go to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Gateway")
4. Select **Full access** permission
5. Copy the key — you'll need it for `.env`

## Step 5: Configure Webhooks

1. Go to **Webhooks** in the Resend dashboard
2. Click **Add Webhook**
3. Set the URL to `https://your-server.com/api/webhook`
4. Select events: at minimum, **email.received**
5. Copy the **signing secret** — you'll need it for `.env`

## Step 6: Deploy

### Clone the repository

```bash
git clone https://github.com/iAmR4j35h/OwnMail.git
cd OwnMail
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
DOMAIN=example.com
WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
API_KEY=$(openssl rand -hex 32)
```

### Start the services

```bash
docker compose up -d
```

### Verify

```bash
# Check health
curl http://localhost:8080/api/health

# Check config status
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:8080/api/config/status
```

## Development Setup

For local development without Docker:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Copy env file
cp .env.example .env
# Edit .env with your values

# Run in development mode
pnpm dev
```

The server runs on `http://localhost:8080` and the dashboard on `http://localhost:3000`.

## Tunneling Webhooks for Local Development

When developing locally, Resend needs a public URL to deliver webhooks. You can use a tunneling service to expose your local server.

### Option 1: Telebit (free, open-source)

[Telebit](https://telebit.cloud/) is a free, open-source tunnel that gives you a stable HTTPS URL.

```bash
# Install Telebit
curl https://get.telebit.io/ | bash

# Forward traffic to your local server
telebit http 8080
# Forwarding https://yourname.telebit.io => localhost:8080
```

Use the Telebit URL as your webhook endpoint in Resend:

```
https://yourname.telebit.io/api/webhook
```

### Option 2: ngrok

```bash
ngrok http 8080
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io/api/webhook`) as your webhook endpoint in Resend.
