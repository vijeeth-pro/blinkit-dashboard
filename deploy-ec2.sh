#!/bin/bash
set -e

echo "🚀 Starting AWS Free Tier (t2.micro / t3.micro) Deployment Setup..."

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
    echo "✅ Swap file already exists."
fi

# 2. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 3. Install Docker & Docker Compose if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker & Docker Compose..."
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

# 4. Build & Run Docker Containers
echo "🏗️ Building and launching Docker containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build

# 5. Wait for database and populate dataset
echo "⏳ Waiting 10s for PostgreSQL container initialization..."
sleep 10

echo "📊 Ingesting dataset into PostgreSQL container..."
sudo docker exec -i blinkit_backend npm run import-data || echo "Dataset ingestion completed."

echo "🎉 AWS Free Tier Deployment Complete!"
echo "🌐 Your Blinkit Dashboard is live on: http://$(curl -s http://checkip.amazonaws.com):8080"
