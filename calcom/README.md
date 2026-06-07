# Cal.com on Hostess

This example runs Cal.com with Hostess-managed Postgres and Redis.

The Hostess config uses the published `calcom/cal.com:v6.2.0` image and keeps
the stack image-only. Cal.com's source-built v2 API service is intentionally
not included.

Related Hostess docs:

- [Deploy the Cal.com Stack](https://docs.hostess.sh/guides/calcom-stack)
- [Managing Secrets](https://docs.hostess.sh/guides/managing-secrets)
- [Redis on Hostess](https://docs.hostess.sh/docs/service-types/redis)

## Hostess

```sh
hostess validate
hostess deploy
```

Required secrets:

- `NEXTAUTH_SECRET`
    - Hint: `hostess secrets set NEXTAUTH_SECRET --value "$(openssl rand -base64 32)"`
- `CALENDSO_ENCRYPTION_KEY`
    - Hint: `hostess secrets set CALENDSO_ENCRYPTION_KEY --value "$(openssl rand -base64 32)"`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`

Use your SMTP provider values for the `EMAIL_*` secrets.

### Sending Real Emails with Resend SMTP

For the lowest-friction real email experience, use Resend SMTP:

```sh
hostess secrets add EMAIL_SERVER_HOST --value "smtp.resend.com"
hostess secrets add EMAIL_SERVER_PORT --value "465"
hostess secrets add EMAIL_SERVER_USER --value "resend"
hostess secrets add EMAIL_SERVER_PASSWORD --value "YOUR_RESEND_API_KEY"
```

> **Note:** Resend requires a verified sending domain. Use the fixed username `resend` and your API key as the password.

### Email Testing with Mailtrap Sandbox

If you only need to smoke test email features, use Mailtrap Email Sandbox:

```sh
hostess secrets add EMAIL_SERVER_HOST --value "sandbox.smtp.mailtrap.io"
hostess secrets add EMAIL_SERVER_PORT --value "2525"
hostess secrets add EMAIL_SERVER_USER --value "YOUR_MAILTRAP_SANDBOX_USERNAME"
hostess secrets add EMAIL_SERVER_PASSWORD --value "YOUR_MAILTRAP_SANDBOX_PASSWORD"
```

Mailtrap sandbox emails are captured in Mailtrap and are **not** delivered to real recipients.

## Local Compose

```sh
docker compose up
```

The local app listens on `http://localhost:3000`.
