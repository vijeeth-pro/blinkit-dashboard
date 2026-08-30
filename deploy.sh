#!/bin/bash
set -e

echo "================================================================="
echo "🚀 AWS EC2 Linux Fresh Database & Container Deployment Pipeline"
echo "================================================================="
echo "📌 Target: AWS EC2 Linux Instance (t2.micro / t3.micro / Custom)"
echo "📌 Database Strategy: Fresh PostgreSQL 16 container with automatic"
echo "   schema creation, table indexing, & dataset mapping (103,340 rows)."
echo "📌 Port Allocation: Web App: 8080 | Backend API: 5002 | DB: 5433"
echo "================================================================="

# 1. Setup 2GB Swap Space to prevent Out-Of-Memory (OOM) kills on 1GB RAM EC2 instances
if [ ! -f /swapfile ]; then
    echo "🧠 Creating 2GB Swap file for AWS Free Tier memory optimization..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ 2GB Swap file configured successfully!"
else
    echo "✅ 2GB Swap memory already active."
fi

# 2. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 3. Install Docker & Docker Compose plugin if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine & Docker Compose plugin..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully!"
else
    echo "✅ Docker is already installed."
fi

# 4. Build & Launch Containers (PostgreSQL, Express API, Nginx SPA)
echo "🏗️ Building and launching Docker containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build

# 5. Wait for Fresh PostgreSQL Container Health Check
echo "⏳ Waiting for fresh PostgreSQL database container initialization..."
until sudo docker exec blinkit_postgres pg_isready -U postgres -d blinkit_db &>/dev/null; do
    echo "   ...waiting for fresh postgres database connection..."
    sleep 3
done
echo "✅ Fresh PostgreSQL database is online and ready for schema mapping!"

# 6. Execute Fresh DB Schema Creation & Dataset Mapping
echo "📊 Executing Fresh DB Schema Creation & Dataset Mapping (103,340 analytical records)..."
sudo docker exec -i blinkit_backend npm run import-data

echo "================================================================="
echo "🎉 AWS EC2 Fresh DB Deployment & Data Mapping Complete!"
echo "🌐 Your Blinkit Dashboard is live on: http://$(curl -s http://checkip.amazonaws.com):8080"
echo "================================================================="
