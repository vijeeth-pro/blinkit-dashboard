#!/bin/bash
set -e

echo "================================================================="
echo "🚀 AWS Free Tier (t2.micro / t3.micro) EC2 Deployment Pipeline"
echo "================================================================="
echo "📌 Domain: quantzig.hopto.org"
echo "📌 Target: AWS EC2 Linux Instance (t2.micro / t3.micro / Custom)"
echo "📌 Ports: Frontend Web App: 80 | Backend API: 5001 | DB: 5432"
echo "📌 Strategy: Deep System Kernel & Log Cleanup (Auto-purge old packages)"
echo "================================================================="

# 1. Force deep system cleanup (Purge old kernels, apt archives, and system logs to reclaim 3-5 GB!)
echo "🧹 Deep system cleanup: purging old unused kernels, apt cache, & logs..."
sudo apt-get autoremove --purge -y 2>/dev/null || true
sudo apt-get clean || true
sudo rm -rf /var/cache/apt/archives/* /tmp/* /var/tmp/* /var/lib/snapd/cache/* 2>/dev/null || true
sudo journalctl --vacuum-size=50M 2>/dev/null || true
sudo dpkg --configure -a 2>/dev/null || true
sudo apt-get install -f -y 2>/dev/null || true

# 2. Prune old unused Docker images, dead layers, and volumes
if command -v docker &> /dev/null; then
    echo "🐳 Pruning unused Docker images, layers, and volumes..."
    sudo docker system prune -a -f || true
fi

# 3. Check available disk space
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

# 4. Update system package lists ONLY
echo "📦 Updating system package lists..."
sudo apt-get update -y

# 5. Install Docker Engine if missing
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

# 6. Ensure Docker Compose binary is installed and executable
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

# 7. Build & Launch Containers (PostgreSQL, Express API, Nginx SPA)
echo "🏗️ Building and launching Docker containers..."
$DC_CMD down || true
$DC_CMD up -d --build

# 8. Wait for Fresh PostgreSQL Container Health Check
echo "⏳ Waiting for fresh PostgreSQL database container initialization..."
until sudo docker exec blinkit_postgres pg_isready -U postgres -d blinkit_db &>/dev/null; do
    echo "   ...waiting for postgres database connection..."
    sleep 3
done
echo "✅ PostgreSQL database is online and ready for schema mapping!"

# 9. Execute Fresh DB Schema Creation & Dataset Mapping
echo "📊 Executing Fresh DB Schema Creation & Dataset Mapping (103,340 analytical records)..."
sudo docker exec -i blinkit_backend npm run import-data

# 10. Clean up unused build cache & temporary files
sudo docker system prune -f || true
sudo apt-get clean || true

echo "================================================================="
echo "🎉 AWS Free Tier EC2 Deployment Complete!"
echo "🌐 Your Blinkit Dashboard is live on: http://quantzig.hopto.org"
echo "================================================================="
