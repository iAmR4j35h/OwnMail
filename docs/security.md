# Security

Security considerations and best practices for running OwnMail.

## Threat Model

### 1. API Key Leakage

**Risk:** If the Resend API key is exposed, an attacker can send email as your domain.

**Mitigations:**
- API key is only loaded server-side via environment variables
- Never exposed to the browser or frontend code
- Dashboard communicates with the Fastify server via server-side requests only
- Use Docker secrets or a secrets manager in production

### 2. Webhook Spoofing

**Risk:** An attacker could send fake webhook payloads to inject emails into your inbox.

**Mitigations:**
- All webhook payloads are verified using Svix signature verification
- The webhook secret is unique to your installation
- Invalid signatures are rejected with 401 status

### 3. Spam Abuse

**Risk:** If your API endpoint is exposed, attackers could use it to send spam through your domain.

**Mitigations:**
- All send requests require a valid API key (Bearer token)
- Monitor your Resend dashboard for unusual activity

### 4. Free-Tier Exhaustion

**Risk:** A compromised or misconfigured system could exhaust your Resend free-tier quota.

**Mitigations:**
- The config status endpoint shows usage statistics
- Set up monitoring alerts on your Resend dashboard

## Best Practices

### Use HTTPS

Always deploy behind HTTPS in production. The webhook endpoint must be HTTPS for Resend to deliver webhooks.

Options:
- Use a reverse proxy (nginx, Caddy, Traefik) with TLS termination
- Use Cloudflare or similar CDN/proxy
- Use Let's Encrypt for free TLS certificates

### Rotate API Keys

- Rotate your `API_KEY` (gateway key) periodically
- Rotate your Resend API key if you suspect compromise
- Update the webhook secret if needed

### Network Security

- Keep the Fastify server (port 8080) internal if possible
- Only expose the dashboard (port 3000) and the webhook endpoint
- Use Docker network isolation

### Secrets Management

- Never commit `.env` files to version control
- Use Docker secrets for sensitive values in production
- Consider using a secrets manager (Vault, AWS Secrets Manager, etc.)

### Monitoring

- Check `/api/health` regularly
- Monitor Resend dashboard for delivery stats
- Set up alerts for failed webhook deliveries
- Watch for unusual sending patterns

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. Do **not** open a public issue
2. Email security concerns to the maintainer directly
3. Include a detailed description and steps to reproduce
4. Allow reasonable time for a fix before public disclosure
