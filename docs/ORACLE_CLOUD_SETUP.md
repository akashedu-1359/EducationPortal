# Oracle Cloud Free Tier — Frontend Deployment Guide

## Architecture
```
GitHub Push (develop branch)
    │
    ▼
GitHub Actions
    ├─ Lint + Type-check
    ├─ Build Docker image (multi-stage, Next.js standalone)
    ├─ Push image to GHCR (GitHub Container Registry)
    └─ SSH into OCI VM → pull image → restart container
          │
          ▼
    Oracle Cloud VM (ARM64 Ampere A1 — Always Free)
    ├─ Nginx (reverse proxy + SSL termination)
    └─ Next.js container (port 3000, internal)
```

---

## Step 1 — Create Oracle Cloud Account

1. Go to https://cloud.oracle.com → **Sign Up** → Always Free tier
2. Complete email verification + payment method (won't be charged)

---

## Step 2 — Create Always Free VM

1. **Console** → Compute → Instances → **Create Instance**
2. **Image**: Ubuntu 22.04 (Minimal)
3. **Shape**: `VM.Standard.A1.Flex` (Ampere ARM64)
   - OCPUs: **4** (max free)
   - Memory: **24 GB** (max free)
4. **SSH Keys**: Upload your public key (generate with `ssh-keygen -t ed25519`)
5. **Boot Volume**: 50 GB (included free)
6. Click **Create**

---

## Step 3 — Configure VCN Security Rules

In Networking → Virtual Cloud Networks → your VCN → Security Lists → Default:

Add **Ingress Rules**:
| Source CIDR | Protocol | Port | Description |
|---|---|---|---|
| 0.0.0.0/0 | TCP | 22 | SSH |
| 0.0.0.0/0 | TCP | 80 | HTTP |
| 0.0.0.0/0 | TCP | 443 | HTTPS |

---

## Step 4 — Prepare the VM

SSH into your VM (replace with your IP):
```bash
ssh -i ~/.ssh/your_key ubuntu@<VM_PUBLIC_IP>
```

Run the bootstrap script:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo bash
sudo usermod -aG docker ubuntu
newgrp docker  # apply group change

# Verify Docker works
docker run --rm hello-world

# Create app directory
mkdir -p ~/eduportal-frontend
cd ~/eduportal-frontend
```

---

## Step 5 — Point Domain to VM

In your DNS provider, create an A record:
```
dev.eduportal.com → <VM_PUBLIC_IP>
```

Wait 5-10 minutes for DNS propagation.

---

## Step 6 — Initial SSL Certificate (First-time only)

SSH into VM and run:
```bash
sudo apt install certbot -y

# Stop nginx if running
docker stop eduportal-nginx 2>/dev/null || true

# Get initial cert (standalone mode)
sudo certbot certonly --standalone \
  --email your@email.com \
  --agree-tos \
  -d dev.eduportal.com

# Verify cert was created
ls /etc/letsencrypt/live/dev.eduportal.com/
```

---

## Step 7 — Start Nginx

Copy the nginx config to the VM:
```bash
scp -i ~/.ssh/your_key -r nginx/ ubuntu@<VM_PUBLIC_IP>:~/eduportal-frontend/
```

Then on the VM:
```bash
cd ~/eduportal-frontend

# Start nginx (as a container) — SSL certs from host
docker run -d \
  --name eduportal-nginx \
  --restart unless-stopped \
  --network host \
  -v ~/eduportal-frontend/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /var/www/certbot:/var/www/certbot:ro \
  nginx:1.27-alpine
```

---

## Step 8 — Configure GitHub Secrets & Variables

In your GitHub repo → **Settings** → **Environments** → **development**:

### Environment Variables (non-secret)
| Name | Value |
|---|---|
| `API_URL` | `https://api-dev.eduportal.com` |
| `APP_URL` | `https://dev.eduportal.com` |
| `APP_NAME` | `EduPortal Dev` |

### Environment Secrets (sensitive)
| Name | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` from Stripe dashboard |
| `RAZORPAY_KEY_ID` | `rzp_test_...` from Razorpay dashboard |
| `REVALIDATION_SECRET` | Any long random string |
| `OCI_SSH_PRIVATE_KEY` | Content of your private key file |
| `OCI_VM_USER` | `ubuntu` |
| `OCI_VM_HOST` | `<VM_PUBLIC_IP>` |

---

## Step 9 — Trigger First Deployment

```bash
# On your local machine, push to develop branch
git push origin develop
```

GitHub Actions will:
1. Lint + type-check the code
2. Build the Next.js Docker image
3. Push to GHCR (`ghcr.io/<your-org>/eduportal-frontend:dev-<sha>`)
4. SSH into your OCI VM and start the container

---

## Monitoring

```bash
# Check container status
docker ps

# View Next.js logs
docker logs -f eduportal-frontend

# View nginx logs
docker logs -f eduportal-nginx

# Check disk usage (keep free space > 10 GB)
df -h

# Clean up old images
docker image prune -f
```

---

## SSL Auto-Renewal

The `certbot` container in `docker-compose.yml` handles renewal every 12h.
Alternatively, add a cron on the VM:
```bash
# Edit crontab
crontab -e

# Add this line (runs at 2:30 AM daily)
30 2 * * * /usr/bin/certbot renew --quiet --pre-hook "docker stop eduportal-nginx" --post-hook "docker start eduportal-nginx"
```

---

## Free Tier Resource Limits

| Resource | Always Free Limit |
|---|---|
| VM Instances | 4 Ampere A1 OCPUs total |
| RAM | 24 GB total |
| Storage | 200 GB block volume |
| Outbound Data | 10 TB/month |
| Object Storage | 20 GB |

The frontend container uses ~200 MB RAM and minimal CPU, well within free limits.
