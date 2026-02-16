# DNS Configuration Guide

This guide explains the DNS records needed for Resend Email Gateway to send and receive email.

## Overview

You need three types of DNS records:

| Record | Purpose | Required For |
|--------|---------|--------------|
| SPF    | Authorizes Resend to send email on your behalf | Sending |
| DKIM   | Cryptographically signs outgoing email | Sending |
| MX     | Routes incoming email to Resend | Receiving |

## SPF (Sender Policy Framework)

### What it does

SPF tells receiving mail servers which servers are allowed to send email from your domain. Without it, your emails are likely to land in spam.

### How to configure

Add a TXT record to your domain:

```
Type:  TXT
Name:  @  (or your domain)
Value: v=spf1 include:send.resend.com ~all
```

If you already have an SPF record, add `include:send.resend.com` to the existing record:

```
v=spf1 include:_spf.google.com include:send.resend.com ~all
```

### Common mistakes

- Creating multiple SPF records (you can only have one per domain)
- Using `-all` instead of `~all` (hard fail can cause delivery issues during setup)

## DKIM (DomainKeys Identified Mail)

### What it does

DKIM adds a cryptographic signature to your outgoing emails. Receiving servers verify this signature to confirm the email wasn't tampered with in transit.

### How to configure

Resend provides the DKIM records when you add your domain. You'll typically need to add 3 CNAME records:

```
Type:  CNAME
Name:  resend._domainkey
Value: (provided by Resend)

Type:  CNAME
Name:  resend2._domainkey
Value: (provided by Resend)

Type:  CNAME
Name:  resend3._domainkey
Value: (provided by Resend)
```

The exact values are shown in your Resend dashboard under Domains.

### Common mistakes

- Copying the records incorrectly (double-check for trailing dots)
- Not waiting for DNS propagation (can take up to 48 hours, usually 15 minutes)

## MX (Mail Exchange)

### What it does

MX records tell other mail servers where to deliver email addressed to your domain. This is required for **receiving** inbound email.

### How to configure

Add an MX record:

```
Type:     MX
Name:     @  (or your domain)
Value:    feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

Check the Resend dashboard for the correct MX value — it may vary by region.

### Common mistakes

- Setting incorrect priority values
- Not removing conflicting MX records from other providers

## Verification

### Check DNS propagation

Use these tools to verify your records:

- [MXToolbox](https://mxtoolbox.com/SuperTool.aspx) — check SPF, DKIM, MX
- [Google Admin Toolbox](https://toolbox.googleapps.com/apps/dig/) — DNS lookup
- `dig` command line: `dig TXT example.com`, `dig MX example.com`

### Check in Resend Dashboard

The Resend dashboard shows the verification status of each record. Green checkmarks mean the records are correctly configured.

### Check via the Gateway API

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:8080/api/config/status
```

This returns the domain status including individual record verification states.

## Troubleshooting

### Records not verifying

- DNS changes can take up to 48 hours to propagate globally
- Double-check for typos in record values
- Ensure you're adding records to the correct domain/subdomain
- Some DNS providers add the domain automatically — don't include it twice

### Emails going to spam

- Verify SPF and DKIM are both passing
- Start with a small volume and increase gradually
- Avoid spammy subject lines during testing
- Check your domain's reputation at [Google Postmaster Tools](https://postmaster.google.com/)

### Not receiving inbound email

- Verify MX record is correctly configured
- Ensure your webhook endpoint is publicly accessible
- Check the Resend dashboard for webhook delivery logs
- Verify the webhook secret matches your `.env` configuration
