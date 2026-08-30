# ☁️ AWS Free Tier EC2 Deployment Guide — Blinkit BI Dashboard

This guide provides step-by-step instructions for deploying the **Blinkit Business Intelligence & Reporting Platform** on an **AWS EC2 Free Tier (`t2.micro` or `t3.micro`) instance**.

---

## 🔌 Standard Production Port Scheme (Free Tier)

| Service | Container Port | Host Port (EC2) | Security Group Rule |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `80` | **`80`** | HTTP (`80`) — Anywhere |
| **Backend Express API** | `5001` | **`5001`** | Custom TCP (`5001`) — Anywhere *(Optional)* |
| **PostgreSQL Database** | `5432` | **`5432`** | Localhost / Internal Docker Network |

---

## 💡 AWS Free Tier (`t2.micro`) Lightweight Memory Optimization

AWS Free Tier EC2 instances (`t2.micro` / `t3.micro`) provide **1 vCPU and 1 GB RAM**.  
To ensure your deployment stays 100% free with zero extra charges:
- The automated deployment script ([`deploy.sh`](file:///Users/vijeethsankar/project/blinkit/deploy.sh)) **automatically allocates a lightweight 1 GB Swap file (`/swapfile`)**, expanding total virtual memory to **2 GB total**, keeping memory usage low and stable without needing paid RAM upgrades!

---

## 🛠️ Step 1: Provision AWS Free Tier EC2 Instance

1. Log into your **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**:
   - **Name**: `blinkit-bi-server`
   - **AMI**: `Ubuntu Server 24.04 LTS (HVM), SSD Volume Type` (64-bit x86)
   - **Instance Type**: `t2.micro` or `t3.micro` (**Free Tier Eligible**)
   - **Key Pair**: Select or create your SSH key pair (`.pem` file)
3. **Network & Security Group Settings**:
   Allow inbound traffic for the following ports:
   - `SSH` (Port 22) — Anywhere or Your IP
   - `HTTP` (Port 80) — Anywhere (`0.0.0.0/0`)
   - `HTTPS` (Port 443) — Anywhere (`0.0.0.0/0`)
4. Click **Launch Instance**.

---

## 🚀 Option A: Automated One-Click Docker Deployment (Recommended)

### 1. SSH into your EC2 Instance
```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2. Clone the Repository
```bash
git clone https://github.com/vijeeth-pro/blinkit-dashboard.git
cd blinkit-dashboard
git checkout dev
```

### 3. Run the Automated Free Tier Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh
```

The script will automatically:
- Configure a lightweight **1 GB Swap file** to prevent memory locks.
- Install Docker & Docker Compose.
- Spin up PostgreSQL 16 (`blinkit_db`), Express Backend API (Port 5001), and Nginx Frontend SPA (Port 80).
- Automatically ingest all **103,340 analytical records** into PostgreSQL.

Your dashboard will be live at `http://YOUR_EC2_PUBLIC_IP`!

---

## 📦 Option B: Manual Setup (Node.js + PM2 + Nginx + Local Postgres)

If deploying directly on Ubuntu without Docker:

### 1. Configure Swap Space
```bash
sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Install Node.js v22 & PostgreSQL
```bash
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
sudo npm install -g pm2
sudo apt-get install -y postgresql postgresql-contrib
```

### 3. Configure Database & Start Backend
```bash
sudo -u postgres psql -c "CREATE DATABASE blinkit_db;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgrespassword';"

cd backend
cp .env.example .env
npm ci
npm run build
npm run import-data

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4. Build Frontend & Configure Nginx
```bash
cd ../frontend
cp .env.example .env
npm ci
npm run build

sudo apt-get install -y nginx
sudo cp nginx.conf /etc/nginx/sites-available/blinkit
sudo ln -s /etc/nginx/sites-available/blinkit /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```
