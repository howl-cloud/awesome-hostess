# Deploy Buzz with Hostess

**Buzz** is an open-source Slack alternative built by [Block](https://block.xyz). It's a
Nostr-relay-based team chat: messages, channels, and media flow through a Buzz relay that
speaks the Nostr protocol, backed by Postgres (data), Redis (pub/sub), and an S3-compatible
object store (media + a git-backed object store for attachments).

This repository is **not** the Buzz source — it's a [Hostess](https://hostess.sh)
deployment config (`hostess.yml`) that stands up a production Buzz relay in one command.
[Hostess](https://hostess.sh) is a managed PaaS: you
describe your services in `hostess.yml`, run `hostess deploy`, and it provisions the
databases, object store, TLS, and public URL for you.

---

## For humans

You don't have to run the steps below by hand. This README is written primarily as a
**runbook for an AI coding agent**. Open your agent (Claude Code, Codex, etc.) and say:

> "Deploy Buzz to Hostess by following the README. Reference the docs at https://docs.hostess.sh/llms.txt."

The agent will generate secrets, push them, and run the deploy. Your only manual
prerequisites are the two things an agent can't do for you:

### Prerequisites (do these first)

1. **Create a Hostess account** at [hostess.sh](https://hostess.sh).
2. **Install the Hostess CLI:**
   ```bash
   # macOS / Linux
   curl -fsSL https://hostess.sh/install.sh | sh
   # or Homebrew
   brew install howl-cloud/tap/hostess
   # Windows (PowerShell)
   irm https://hostess.sh/install.ps1 | iex
   ```
3. **Log in** (opens a browser):
   ```bash
   hostess login
   ```
4. **Choose the relay owner identity.** Buzz's membership gate is key-based. The relay is
   configured with the owner's **public** key, but the desktop app must later import the
   matching **private** key. Keep both together while setting up the deployment.

### What gets deployed

| Service | Type | Purpose | Exposure |
|---|---|---|---|
| `relay` | custom (`ghcr.io/block/buzz`) | The Buzz Nostr relay (chat, auth, media, git object store) | **Public** — your `wss://…` relay URL |
| `postgres` | managed Postgres 17 | Primary data store (daily backups + PITR) | Private |
| `redis` | managed Redis 8 | Pub/sub + presence | Private |
| `minio` | custom (`minio/minio`) | S3-compatible object store for media | Private API; console (`:9001`) is **team**-visible via Hostess SSO |
| `bootstrap-minio` | job (`minio/mc`) | One-shot: creates the `buzz-media` bucket on each deploy | — |

---

## For AI agents

You are deploying Buzz to Hostess on behalf of the user. Follow these steps in order. Do
**not** invent values or skip steps.

### Preconditions to confirm before you start

Run these and stop to ask the user if any fail — they are the human-only prerequisites:

```bash
hostess whoami             # must print a logged-in user + org. If not: user runs `hostess login`.
command -v hostess         # CLI must be installed (see "Prerequisites" above).
```

The project name is taken from the `name:` field in `hostess.yml` (**`buzz`**). The target
environment is **`production`** (Hostess's default).

### Step 1 — Validate the config

```bash
hostess validate
```

Fix any schema errors before continuing. Do not edit service topology (ports, `depends_on`,
magic variables like `${minio.port_1.url}`) unless the user asks — this config is already
known-good.

### Step 2 — Generate secrets

`hostess.yml` references exactly **five** secrets via `${secret:NAME}`. Generate them and
write a clean `.env` (this file is gitignored — never commit it). The `MINIO_*` and HMAC
values can be random; the two Nostr identities need a little more care.

```bash
# Object-store root credentials (random)
echo "MINIO_ROOT_USER=$(openssl rand -hex 8)"        >  .env
echo "MINIO_ROOT_PASSWORD=$(openssl rand -hex 24)"   >> .env

# Git-hook HMAC secret (random)
echo "BUZZ_GIT_HOOK_HMAC_SECRET=$(openssl rand -hex 32)" >> .env
```

### Generate the two Nostr identities

The Buzz image already contains `buzz-admin`, so this does not require installing another
Nostr utility. Pin the same image used by `hostess.yml`:

```bash
BUZZ_IMAGE=ghcr.io/block/buzz:sha-7e34bee

relay_keys="$(docker run --rm --entrypoint buzz-admin "$BUZZ_IMAGE" generate-key)"
owner_keys="$(docker run --rm --entrypoint buzz-admin "$BUZZ_IMAGE" generate-key)"

relay_secret="$(printf '%s\n' "$relay_keys" | awk '/Secret key:/ {print $3}')"
owner_public="$(printf '%s\n' "$owner_keys" | awk '/Public key:/ {print $3}')"
owner_secret="$(printf '%s\n' "$owner_keys" | awk '/Secret key:/ {print $3}')"

printf 'BUZZ_RELAY_PRIVATE_KEY=%s\n' "$relay_secret" >> .env
printf 'RELAY_OWNER_PUBKEY=%s\n' "$owner_public" >> .env

# These must all be 64. Do not deploy if one is blank or has another length.
printf 'relay secret: %s, owner public: %s, owner secret: %s\n' \
  "${#relay_secret}" "${#owner_public}" "${#owner_secret}"
```

Expected output is `relay secret: 64, owner public: 64, owner secret: 64`.

`owner_secret` is deliberately **not** written to `.env`: it is the human owner's login,
not a relay runtime secret. Keep the current terminal open until it has been imported into
the Buzz desktop app. Do not print it into shell history, commit it, or share it. If it is
lost before import, generate a new owner pair, replace `RELAY_OWNER_PUBKEY`, sync, and
redeploy.

After this, `.env` should contain **only** these five keys:

```
MINIO_ROOT_USER=…
MINIO_ROOT_PASSWORD=…
BUZZ_GIT_HOOK_HMAC_SECRET=…
BUZZ_RELAY_PRIVATE_KEY=…
RELAY_OWNER_PUBKEY=…
```

### Step 3 — Push secrets to the production environment

```bash
hostess environments ensure production        # idempotent; creates the env if missing
hostess secrets sync push --env production     # uploads .env to the remote environment
```

### Step 4 — Deploy

```bash
hostess deploy --env production
```

This builds nothing (all images are pre-built), provisions Postgres/Redis/MinIO, runs the
`bootstrap-minio` job to create the `buzz-media` bucket, then rolls out the relay. 

### Step 5 — Verify (do not skip)

```bash
hostess services list --env production          # all services should be Running/Ready
hostess services logs relay --env production     # confirm relay health
```

A healthy relay logs, in order:

- `git object-store backend admitted: A3 conformance probe passed`
- `buzz-relay TCP listening`, `addr 0.0.0.0:3000`

The **A3 conformance probe** is the critical gate: the relay fires concurrent S3
compare-and-swap (`If-Match`) writes and requires exactly one winner. It passes only against
a store with real CAS semantics — which is why this config uses **MinIO** (Garage does not
enforce `If-Match` and fails the probe). If you see `if_match_race … got 32`, the bucket is
missing or the store lacks CAS — check that `bootstrap-minio` completed.

Get the public relay URL:

```bash
hostess inspect --env production
```

Copy the relay's `https://...hostess.run` external URL. That HTTPS URL **is the Buzz
community URL** entered in the desktop app; Buzz converts it to `wss://` internally. The
MinIO console (`:9001`) is **team**-visible — only org members reach it, gated behind Hostess SSO.

### Step 6 — Connect the Buzz desktop app as the owner

Opening the community URL with the desktop app's automatically generated identity produces
**Membership required / Not a member yet**. That is expected: this deployment requires
membership and initially admits only `RELAY_OWNER_PUBKEY`.

The desktop import field expects the owner's secret in NIP-19 `nsec1...` form, not the
64-character hex value stored in `owner_secret`. Convert it without sending it to a website:

```bash
owner_nsec="$(python3 - "$owner_secret" <<'PY'
import sys

charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

def polymod(values):
    generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    checksum = 1
    for value in values:
        top = checksum >> 25
        checksum = ((checksum & 0x1ffffff) << 5) ^ value
        for index, generator in enumerate(generators):
            if (top >> index) & 1:
                checksum ^= generator
    return checksum

def convert_bits(data):
    accumulator = bits = 0
    result = []
    for value in data:
        accumulator = (accumulator << 8) | value
        bits += 8
        while bits >= 5:
            bits -= 5
            result.append((accumulator >> bits) & 31)
    if bits:
        result.append((accumulator << (5 - bits)) & 31)
    return result

secret = sys.argv[1]
if len(secret) != 64:
    raise SystemExit("owner secret must be exactly 64 hex characters")

hrp = "nsec"
data = convert_bits(bytes.fromhex(secret))
expanded = [ord(c) >> 5 for c in hrp] + [0] + [ord(c) & 31 for c in hrp]
mod = polymod(expanded + data + [0] * 6) ^ 1
checksum = [(mod >> (5 * (5 - i))) & 31 for i in range(6)]
print(hrp + "1" + "".join(charset[v] for v in data + checksum))
PY
)"

printf 'Prefix: %.5s  Length: %s\n' "$owner_nsec" "${#owner_nsec}"
printf '%s' "$owner_nsec" | pbcopy  # macOS: copy without displaying the secret
```

The check should report `Prefix: nsec1` and `Length: 63`. Then:

1. In Buzz, choose **Have an invite?** or **Use a different key** from the membership page.
2. Paste the copied `nsec1...` value into **Private key**. **Import key** should enable.
3. Import it. Buzz saves the identity in the macOS Keychain.
4. If Buzz remains on **Setting up your community...**, press **Command-R**. If it still
   does not advance after 10–20 seconds, fully quit with **Command-Q** and reopen it. Do not
   regenerate keys or delete app data first—the relay may already have accepted the owner.

After a successful import, clear the sensitive shell variables:

```bash
unset owner_secret owner_nsec owner_keys relay_secret relay_keys
```

### Troubleshooting quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| `project 'buzz' not found` | Project not created yet | `hostess deploy` prompts to create it; or `hostess projects create buzz` |
| relay `CreateContainerConfigError: couldn't find key … in Secret` | Secrets not pushed / stale | Re-run Step 3, then redeploy |
| `bootstrap-minio` job `Error`, `mc: … is not a recognized command` | `entrypoint`/`command` mixup | Already fixed in this `hostess.yml`; don't remove the `entrypoint: ["/bin/sh","-c"]` line |
| A3 probe `got 32` winners | Bucket missing or store lacks CAS | Ensure `bootstrap-minio` ran; keep MinIO (not Garage) |
| relay `CrashLoopBackOff` | Bad `RELAY_OWNER_PUBKEY` or DB not ready | Check `hostess services logs relay`; verify the pubkey is 64-char hex |
| Desktop says `Not a member yet` | Desktop generated a different identity | Import the `nsec` matching `RELAY_OWNER_PUBKEY`; do not import the relay's private key |
| **Import key** stays disabled | Raw hex or malformed key was pasted | Convert the 64-char owner secret to `nsec1...`; expect length 63 |
| Stuck on **Setting up your community...** after import | Desktop onboarding transaction did not advance | Press Command-R, then Command-Q/reopen; check relay logs before resetting app data |

---

Config reference: [`hostess.yml`](./hostess.yml) · Full docs: [docs.hostess.sh](https://docs.hostess.sh)
