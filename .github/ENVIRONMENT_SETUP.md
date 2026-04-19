# GitHub Environments — Setup Guide

Two environments: **development** and **production**. No QA.

---

## Deployment Flow

```
Any push (not main)  ──→  deploy-dev.yml  ──→  Dev OCI VM
                              ├─ lint + type-check
                              ├─ build Docker image → push to GHCR
                              └─ SSH → pull image → restart container

PR opened to main    ──→  ci.yml (gate)   ──→  lint + typecheck + tests + build
                              └─ must pass before merge is allowed

PR merged to main    ──→  deploy-prod.yml ──→  Prod OCI VM
                              ├─ lint + type-check + unit tests
                              ├─ build Docker image → push to GHCR
                              ├─ SSH → pull image → restart container
                              └─ create GitHub release tag (v{date}-{sha})
```

---

## Step 1 — Create GitHub Environments

Repo → **Settings** → **Environments** → **New environment**

Create:
- `development`
- `production`

For **production**, enable:
- **Required reviewers** — add yourself (manual approval gate before deploy)

---

## Step 2 — Configure Environments

### `development` — Variables & Secrets

**Variables** (non-sensitive):
| Name | Example |
|---|---|
| `API_URL` | `https://api-dev.eduportal.com` |
| `APP_URL` | `https://dev.eduportal.com` |
| `APP_NAME` | `EduPortal Dev` |

**Secrets**:
| Name | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Cloud Console OAuth 2.0 Client ID |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `RAZORPAY_KEY_ID` | `rzp_test_...` |
| `REVALIDATION_SECRET` | `openssl rand -hex 32` |
| `OCI_SSH_PRIVATE_KEY` | Content of `~/.ssh/id_ed25519` for dev VM |
| `OCI_VM_HOST` | Public IP of dev Oracle Cloud VM |
| `OCI_VM_USER` | `ubuntu` |

---

### `production` — Variables & Secrets

**Variables**:
| Name | Example |
|---|---|
| `API_URL` | `https://api.eduportal.com` |
| `APP_URL` | `https://eduportal.com` |
| `APP_NAME` | `EduPortal` |

**Secrets**:
| Name | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Production Google OAuth Client ID |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `RAZORPAY_KEY_ID` | `rzp_live_...` |
| `REVALIDATION_SECRET` | Different value from dev |
| `OCI_SSH_PRIVATE_KEY` | Private key for **prod** OCI VM |
| `OCI_VM_HOST` | Public IP of prod OCI VM |
| `OCI_VM_USER` | `ubuntu` |

---

## Step 3 — Branch Protection for `main`

Repo → **Settings** → **Branches** → Add rule for `main`:

- ✅ Require a pull request before merging
- ✅ Require status checks: `Lint · Type Check · Tests · Build` (from `ci.yml`)
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

This guarantees production only ever receives code that passed CI.

---

## Daily Workflow

```bash
# Create a feature branch
git checkout -b feat/my-feature

# Develop, commit, push
git push origin feat/my-feature
# ↑ Automatically deploys to dev for testing

# Open PR to main → CI gate runs
# After review → Merge PR
# ↑ Automatically deploys to production
```

---

## Generate Secrets

```bash
# REVALIDATION_SECRET
openssl rand -hex 32

# SSH key pair for OCI VM deploy
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/oci_deploy_key -N ""

# Add public key to the OCI VM
ssh-copy-id -i ~/.ssh/oci_deploy_key.pub ubuntu@<VM_IP>

# Copy private key → paste into GitHub Secret OCI_SSH_PRIVATE_KEY
cat ~/.ssh/oci_deploy_key
```
