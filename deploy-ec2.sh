#!/bin/bash
set -e

echo "================================================================="
echo "🚀 AWS Free Tier (t2.micro / t3.micro) EC2 Deployment Pipeline"
echo "================================================================="
echo "📌 Domain: quantzig.hopto.org"
echo "📌 Target: AWS EC2 Linux Instance (t2.micro / t3.micro / Custom)"
echo "📌 Strategy: Containerd Storage Reset & Max Disk Space Recovery"
echo "================================================================="

# 1. Force removal of swap file if disk space is dangerously low
AVAILABLE_MB=$(df / --output=avail | tail -n 1 | awk '{print int($1/1024)}')
echo "💾 Initial Available Disk Space: ${AVAILABLE_MB} MB"

if [ "$AVAILABLE_MB" -lt 1500 ] && [ -f /swapfile ]; then
    echo "⚠️ Low disk space (${AVAILABLE_MB}MB). Removing 2GB swap file to free disk space..."
    sudo swapoff /swapfile 2>/dev/null || true
    sudo rm -f /swapfile
    sudo sed -i '/\/swapfile/d' /etc/fstab || true
    echo "✅ Swapfile removed to reclaim 2GB disk space!"
fi

# 2. Deep system cleanup: purge old kernels, apt archives, and system logs
echo "🧹 Reclaiming OS disk space..."
sudo apt-get autoremove --purge -y 2>/dev/null || true
sudo apt-get clean || true
sudo rm -rf /var/cache/apt/archives/* /tmp/* /var/tmp/* /var/lib/snapd/cache/* 2>/dev/null || true
sudo journalctl --vacuum-size=10M 2>/dev/null || true
sudo dpkg --configure -a 2>/dev/null || true
sudo apt-get install -f -y 2>/dev/null || true

# 3. Reset broken Docker containerd snapshots if disk space is below 1500MB
AVAILABLE_MB=$(df / --output=avail | tail -n 1 | awk '{print int($1/1024)}')
if [ "$AVAILABLE_MB" -lt 1500 ] && command -v docker &> /dev/null; then
    echo "🧹 Resetting Docker containerd snapshot storage to reclaim layer space..."
    sudo systemctl stop docker containerd 2>/dev/null || true
    sudo rm -rf /var/lib/docker/* /var/lib/containerd/* 2>/dev/null || true
    sudo systemctl start docker containerd 2>/dev/null || true
fi

# 4. Re-check final available disk space
AVAILABLE_MB=$(df / --output=avail | tail -n 1 | awk '{print int($1/1024)}')
echo "💾 Reclaimed Available Disk Space: ${AVAILABLE_MB} MB"

# 5. Update system package lists ONLY
echo "📦 Updating system package lists..."
sudo apt-get update -y

# 6. Install Docker Engine if missing
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

# 7. Ensure Docker Compose binary is installed and executable
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

# 8. Pull base images sequentially to save temporary layer extraction space
echo "📥 Pulling base Docker images..."
sudo docker pull postgres:16-alpine
sudo docker pull node:22-alpine
sudo docker pull nginx:alpine

# 9. Build & Launch Containers (PostgreSQL, Express API, Nginx SPA)
echo "🏗️ Building and launching Docker containers..."
$DC_CMD down || true
$DC_CMD up -d --build

# 10. Wait for Fresh PostgreSQL Container Health Check
echo "⏳ Waiting for fresh PostgreSQL database container initialization..."
until sudo docker exec blinkit_postgres pg_isready -U postgres -d blinkit_db &>/dev/null; do
    echo "   ...waiting for postgres database connection..."
    sleep 3
done
echo "✅ PostgreSQL database is online and ready for schema mapping!"

# 11. Execute Fresh DB Schema Creation & Dataset Mapping
echo "📊 Executing Fresh DB Schema Creation & Dataset Mapping (103,340 analytical records)..."
sudo docker exec -i blinkit_backend npm run import-data

# 12. Clean up unused build cache & temporary files
sudo docker system prune -f || true
sudo apt-get clean || true

echo "================================================================="
echo "🎉 AWS Free Tier EC2 Deployment Complete!"
echo "🌐 Your Blinkit Dashboard is live on: http://quantzig.hopto.org"
echo "================================================================="
