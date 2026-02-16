# Roadmap

## Milestone 1 — Core MVP (v0.1.0)

- [x] Send email via REST API (Resend integration)
- [x] Receive inbound email via webhook
- [x] Store emails locally (SQLite)
- [x] Inbox dashboard (list, view, filter)
- [x] Configuration status page
- [x] Docker Compose deployment
- [x] Bearer token authentication
- [x] Rate limiting
- [x] Webhook signature verification (Svix)

## Milestone 2 — Hardening (v0.2.0)

- [ ] Comprehensive error handling and retry logic
- [ ] Structured logging with log rotation
- [ ] Health check improvements (dependency checks)
- [ ] Email search (full-text)
- [ ] Attachment support
- [ ] Email reply/forward from dashboard
- [ ] Automated tests (unit + integration)

## Milestone 3 — Storage & Extensibility (v0.3.0)

- [ ] PostgreSQL storage adapter
- [ ] Plugin system (event hooks: OnEmailReceived, OnEmailSent)
- [ ] Custom storage adapter documentation
- [ ] Email retention policies (auto-delete after N days)
- [ ] Export/backup functionality

## Milestone 4 — Ecosystem (v0.4.0)

- [ ] SMTP bridge (accept email via local SMTP, forward via Resend)
- [ ] IMAP compatibility layer (connect external mail clients)
- [ ] Multi-user accounts (admin + user roles)
- [ ] Per-user inboxes

## Milestone 5 — Production Ready (v1.0.0)

- [ ] JWT authentication
- [ ] API rate limiting per user
- [ ] Audit logging
- [ ] Monitoring dashboard (usage stats, rate limit tracking)
- [ ] Provider abstraction (support for alternative email APIs)
- [ ] Comprehensive documentation site
- [ ] Stable API with semantic versioning guarantee

## Future Ideas

- Email templates
- Scheduled sending
- Contact management
- Email analytics
- Webhook forwarding (notify external services on email events)
- CLI tool for management
- Kubernetes Helm chart
