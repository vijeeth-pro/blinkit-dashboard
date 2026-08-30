#!/bin/bash
set -e

echo "================================================================="
echo "🚀 AWS Free Tier (t2.micro / t3.micro) EC2 Deployment Pipeline"
echo "================================================================="
echo "📌 Target: AWS EC2 Free Tier Instance (1 vCPU, 1 GB RAM, 8 GB Disk)"
echo "📌 Ports: Frontend Web App: 80 | Backend API: 5001 | DB: 5432"
echo "📌 Memory Strategy: Lightweight swap & safe cache cleanup"
echo "================================================================="

# 1. Force self-healing cleanup of apt cache and broken dpkg states (Frees disk!)
echo "🧹 Purging package cache to ensure maximum free disk space..."
sudo apt-get clean || true
sudo rm -rf /var/cache/apt/archives/* /tmp/* /var/tmp/* 2>/dev/null || true
sudo dpkg --configure -a 2>/dev/null || true
sudo apt-get install -f -y 2>/dev/null || true

# 2. Check available disk space
AVAILABLE_MB=$(df / --output=avail | tail -n 1 | awk '{print int($1/1024)}')
echo "💾 Available Disk Space: ${AVAILABLE_MB} MB"

if [ ! -f /swapfile ]; then
    if [ "$AVAILABLE_MB" -gt 2500 ]; then
        echo "🧠 Creating 1GB Swap file for memory optimization..."
        sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        echo "✅ 1GB Swap file configured successfully!"
    else
        echo "⚠️ Low disk space (${AVAILABLE_MB}MB available). Skipping swap file creation."
    fi
else
    echo "✅ Swap memory already configured."
fi

# 3. Update system package lists ONLY (No kernel upgrade)
echo "📦 Updating system package lists..."
sudo apt-get update -y

# 4. Install Docker & Docker Compose plugin if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine & Docker Compose plugin..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    sudo apt-get clean
    echo "✅ Docker installed successfully!"
else
    echo "✅ Docker is already installed."
fi

# 5. Build & Launch Containers (PostgreSQL, Express API, Nginx SPA)
echo "🏗️ Building and launching Docker containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build

# 6. Wait for Fresh PostgreSQL Container Health Check
echo "⏳ Waiting for fresh PostgreSQL database container initialization..."
until sudo docker exec blinkit_postgres pg_isready -U postgres -d blinkit_db &>/dev/null; do
    echo "   ...waiting for postgres database connection..."
    sleep 3
done
echo "✅ PostgreSQL database is online and ready for schema mapping!"

# 7. Execute Fresh DB Schema Creation & Dataset Mapping
echo "📊 Executing Fresh DB Schema Creation & Dataset Mapping (103,340 analytical records)..."
sudo docker exec -i blinkit_backend npm run import-data

# 8. Clean up unused build cache & temporary files
sudo docker system prune -f || true
sudo apt-get clean || true

echo "================================================================="
echo "🎉 AWS Free Tier EC2 Deployment Complete!"
echo "🌐 Your Blinkit Dashboard is live on: http://$(curl -s http://checkip.amazonaws.com)"
echo "================================================================="
