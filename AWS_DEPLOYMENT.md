# ☁️ AWS Free Tier EC2 Deployment & SSL (HTTPS) Setup Guide

This guide provides step-by-step instructions for deploying the **Blinkit Business Intelligence & Reporting Platform** on an **AWS EC2 Free Tier (`t2.micro` or `t3.micro`) instance** under the domain **`quantzig.hopto.org`** and converting **HTTP (`http://`)** to **HTTPS (`https://`)** for FREE.

---

## 🌐 Live Application Domain
- **HTTP**: [`http://quantzig.hopto.org`](http://quantzig.hopto.org)
- **HTTPS**: [`https://quantzig.hopto.org`](https://quantzig.hopto.org)
- **Host Public IP**: `3.7.248.196` (Mapped via No-IP Dynamic DNS)

---

## 🔌 Standard Production Port Scheme (Free Tier)

| Service | Container Port | Host Port (EC2) | Security Group Rule |
| :--- | :--- | :--- | :--- |
| **Frontend Web App (HTTP)** | `80` | **`80`** | HTTP (`80`) — Anywhere (`0.0.0.0/0`) |
| **Frontend Web App (HTTPS)** | `443` | **`443`** | HTTPS (`443`) — Anywhere (`0.0.0.0/0`) |
| **Backend Express API** | `5001` | **`5001`** | Custom TCP (`5001`) — Anywhere *(Optional)* |
| **PostgreSQL Database** | `5432` | **`5433`** | Localhost / Internal Docker Network |

---

## 🔒 How to Convert HTTP to HTTPS (Free Let's Encrypt SSL)

### Step 1: Allow Port 443 in AWS EC2 Security Group
1. Open **AWS Management Console** -> **EC2** -> **Instances** -> Click your instance (`blinkit-bi-server`).
2. Click **Security** tab -> Click the **Security Group**.
3. Click **Edit Inbound Rules** -> Click **Add Rule**:
   - **Type**: `HTTPS`
   - **Port Range**: `443`
   - **Source**: `Custom` -> `0.0.0.0/0` (Anywhere IPv4)
4. Click **Save Rules**.

---

### Step 2: Issue FREE SSL Certificate with Certbot

On your EC2 SSH terminal, run:

```bash
# 1. Install Certbot
sudo apt-get update -y
sudo apt-get install -y certbot

# 2. Issue SSL Certificate standalone (temporarily frees port 80 for verification)
sudo certbot certonly --standalone -d quantzig.hopto.org
```

Certbot will output:
- Certificate Path: `/etc/letsencrypt/live/quantzig.hopto.org/fullchain.pem`
- Private Key Path: `/etc/letsencrypt/live/quantzig.hopto.org/privkey.pem`

---

### Step 3: Configure HTTPS in Nginx / Docker

#### Option A: Docker Setup (Mount SSL Certs)
Update `docker-compose.yml` to expose port `443` and mount `/etc/letsencrypt`:
```yaml
frontend:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

Update `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name quantzig.hopto.org;
    return 301 https://$host$request_uri; # Redirect HTTP to HTTPS
}

server {
    listen 443 ssl;
    server_name quantzig.hopto.org;

    ssl_certificate /etc/letsencrypt/live/quantzig.hopto.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quantzig.hopto.org/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:5001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Option B: Automatic Nginx Certbot Setup (Non-Docker)
If running Nginx natively on Ubuntu:
```bash
sudo apt-get install -y python3-certbot-nginx
sudo certbot --nginx -d quantzig.hopto.org
```
Select **Option 2 (Redirect)** to automatically redirect all HTTP requests to HTTPS!

---

## 🔄 Automatic 90-Day SSL Renewal
Certbot automatically renews certificates. Test automatic renewal:
```bash
sudo certbot renew --dry-run
```
