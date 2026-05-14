# Security Policy

> **Your data is sacred. We protect it.**

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | ✅ Active Support   |
| 1.x.x   | ⚠️ Security Only    |
| < 1.0   | ❌ End of Life      |

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** create a public GitHub issue
2. Send a private security report via [GitHub Security Advisories](https://github.com/badhope/forever/security/advisories/new)
3. Allow 48 hours for initial response
4. Provide detailed information about the vulnerability

We will:
- Acknowledge receipt within 48 hours
- Provide an estimated timeline for a fix
- Credit you in the security advisory (if desired)
- Keep you informed throughout the resolution process

---

## Data Security Principles

### Local-First Architecture

- **No cloud dependency**: All processing happens locally by default
- **Your data stays yours**: Memories never leave your machine unless you choose
- **No telemetry**: We don't collect any usage data
- **No account required**: Use it anonymously

### API Key Handling

```bash
# Environment variables are NEVER logged
# Keys are stored locally in .env (gitignored)
# Never commit API keys to version control
```

### Memory Data Protection

- Memories stored in `~/.forever/` directory
- Session data encrypted at rest (optional, see Configuration)
- No third-party data sharing
- Complete data deletion capability

---

## Configuration

### Enable Encrypted Storage

```bash
export FOREVER_ENCRYPT_STORAGE=true
export FOREVER_STORAGE_KEY="your-secure-key"
```

### Disable Network Features

```bash
export FOREVER_OFFLINE_MODE=true
```

---

## Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Add `.env` to `.gitignore`
- [ ] Enable storage encryption for sensitive memories
- [ ] Regularly rotate API keys
- [ ] Review memory data before sharing
- [ ] Use offline mode when possible

---

## Dependency Security

We regularly update dependencies to patch known vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

---

## Responsible AI Use

This project includes ethical safeguards:

1. **Guardian Ethics System**: Detects potential emotional manipulation
2. **72-Hour Cooling Period**: Prevents unhealthy attachment patterns
3. **Dependency Monitoring**: Warns when conversations become excessive
4. **Crisis Intervention**: Detects and responds to distress signals

---

## Incident Response

In case of a security incident:

1. We will notify affected users within 72 hours
2. Provide a detailed incident report
3. Release patches as quickly as possible
4. Cooperate with relevant authorities if required

---

## Contact

- **Security Issues**: Use [Private Vulnerability Reporting](https://github.com/badhope/forever/security/advisories/new)
- **General Questions**: Open a discussion

---

> "Privacy is not an option, and it shouldn't be the price we accept for just getting on the Internet."
> — Gary Kovacs
