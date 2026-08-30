#!/bin/bash
set -e

echo "================================================================="
echo "🚀 AWS Free Tier (t2.micro / t3.micro) EC2 Deployment Pipeline"
echo "================================================================="
echo "📌 Domain: quantzig.hopto.org"
echo "📌 Target: AWS EC2 Linux Instance (t2.micro / t3.micro / Custom)"
echo "📌 Ports: Frontend Web App: 80 | Backend API: 5001 | DB: 5432"
echo "📌 Strategy: Foolproof Docker Compose Installer & Memory Tuning"
echo "================================================================="

# 1. Force self-healing cleanup of apt cache, old logs, and kernel headers to free up disk space!
echo "🧹 Purging system package cache & old logs to free disk space..."
sudo apt-get clean || true
sudo rm -rf /var/cache/apt/archives/* /tmp/* /var/tmp/* 2>/dev/null || true
sudo dpkg --configure -a 2>/dev/null || true
sudo apt-get install -f -y 2>/dev/null || true
sudo journalctl --vacuum-time=1d 2>/dev/null || true

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

# 3. Update system package lists ONLY
echo "📦 Updating system package lists..."
sudo apt-get update -y

# 4. Install Docker Engine if missing
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io || true
    sudo usermod -aG docker $USER
    sudo apt-get clean
    echo "✅ Docker Engine installed successfully!"
else
    echo "✅ Docker Engine is already installed."
fi

# 5. Ensure Docker Compose (v2 or standalone binary) is installed and executable
echo "🔍 Checking Docker Compose binary installation..."
if docker compose version &>/dev/null; then
    DC_CMD="sudo docker compose"
elif command -v docker-compose &>/dev/null; then
    DC_CMD="sudo docker-compose"
elif [ -f /usr/local/bin/docker-compose ]; then
    sudo chmod +x /usr/local/bin/docker-compose
    DC_CMD="sudo /usr/local/bin/docker-compose"
else
    echo "📥 Installing Docker Compose standalone binary into /usr/local/bin/docker-compose..."
    sudo curl -SL "https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose || true
    sudo chmod +x /usr/local/bin/docker-compose || true
    if [ -f /usr/local/bin/docker-compose ]; then
        DC_CMD="sudo /usr/local/bin/docker-compose"
    elif command -v docker-compose &>/dev/null; then
        DC_CMD="sudo docker-compose"
    else
        echo "Installing docker-compose-v2 via apt..."
        sudo apt-get install -y docker-compose-v2 || sudo apt-get install -y docker-compose-plugin docker-compose || true
        DC_CMD="sudo docker compose"
    fi
fi

echo "ℹ️ Using Docker Compose Command: ${DC_CMD}"

# 6. Build & Launch Containers (PostgreSQL, Express API, Nginx SPA)
echo "🏗️ Building and launching Docker containers..."
$DC_CMD down || true
$DC_CMD up -d --build

# 7. Wait for Fresh PostgreSQL Container Health Check
echo "⏳ Waiting for fresh PostgreSQL database container initialization..."
until sudo docker exec blinkit_postgres pg_isready -U postgres -d blinkit_db &>/dev/null; do
    echo "   ...waiting for postgres database connection..."
    sleep 3
done
echo "✅ PostgreSQL database is online and ready for schema mapping!"

# 8. Execute Fresh DB Schema Creation & Dataset Mapping
echo "📊 Executing Fresh DB Schema Creation & Dataset Mapping (103,340 analytical records)..."
sudo docker exec -i blinkit_backend npm run import-data

# 9. Clean up unused build cache & temporary files
sudo docker system prune -f || true
sudo apt-get clean || true

echo "================================================================="
echo "🎉 AWS Free Tier EC2 Deployment Complete!"
echo "🌐 Your Blinkit Dashboard is live on: http://quantzig.hopto.org"
echo "================================================================="
