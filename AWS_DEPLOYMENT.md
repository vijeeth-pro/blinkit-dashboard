# ☁️ AWS Free Tier EC2 Deployment Guide — Blinkit BI Dashboard

This guide provides step-by-step instructions for deploying the **Blinkit Business Intelligence & Reporting Platform** on an **AWS EC2 Free Tier (`t2.micro` or `t3.micro`) instance** alongside existing running projects.

---

## 🔌 Non-Conflicting Port Allocation Scheme

To prevent collisions with other projects already running on your EC2 instance:

| Service | Internal Port | Host Port (EC2) | Security Group Rule |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `80` | **`8080`** | Custom TCP (`8080`) — Anywhere |
| **Backend Express API** | `5002` | **`5002`** | Custom TCP (`5002`) — Anywhere |
| **PostgreSQL Database** | `5432` | **`5433`** | Localhost only |

---

## 💡 Important: AWS Free Tier (`t2.micro`) Memory Optimization

AWS Free Tier EC2 instances (`t2.micro` / `t3.micro`) come with **1 vCPU and 1 GB RAM**.  
During `npm install`, Vite building, or Docker image compilation, RAM usage can temporarily exceed 1 GB, causing the Linux kernel to terminate the process (`Killed`).

Our automated script ([`deploy-ec2.sh`](file:///Users/vijeethsankar/project/blinkit/deploy-ec2.sh)) **automatically creates a 2 GB Swap file (`/swapfile`)**, expanding your instance's virtual memory to **3 GB total**, ensuring 100% stable, zero-crash deployment!

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
   - `Custom TCP` (Port 8080) — Anywhere (`0.0.0.0/0`)
   - `Custom TCP` (Port 5002) — Anywhere (`0.0.0.0/0`)
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
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

The script will automatically:
- Configure a **2 GB Swap file** to prevent OOM process kills on 1 GB RAM.
- Install Docker & Docker Compose.
- Spin up PostgreSQL 16 (`blinkit_db`), Express Backend API (Port 5002), and Nginx Frontend SPA (Port 8080).
- Automatically ingest all **103,340 analytical records** into PostgreSQL.

Your dashboard will be live at `http://YOUR_EC2_PUBLIC_IP:8080`!

---

## 📦 Option B: Manual Setup (Node.js + PM2 + Nginx + Local Postgres)

If deploying directly on Ubuntu without Docker:

### 1. Configure 2GB Swap Space
```bash
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
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

---

## 📊 Monitoring & Memory Check

Check available memory and swap on EC2:
```bash
free -h
```
