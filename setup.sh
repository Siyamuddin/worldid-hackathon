#!/bin/bash

# Setup script for WorldID Reward Distribution System

set -e

echo "🚀 Setting up WorldID Reward Distribution System..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your configuration."
    else
        echo "⚠️  .env.example not found. Creating basic .env file..."
        cat > .env << EOF
# WorldID Configuration
WORLDID_APP_ID=app_staging_123
WORLDID_ACTION=worldid-reward-claim
WORLDID_VERIFY_URL=https://developer.worldcoin.org/api/v1/verify

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/demo
PRIVATE_KEY=

# JWT Configuration
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
        echo "✅ Created basic .env file with generated SECRET_KEY."
    fi
else
    echo "✅ .env file already exists."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo ""
echo "📦 Building Docker images..."
docker-compose build

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Development: docker-compose -f docker-compose.dev.yml up"
echo "  Production:  docker-compose up -d"
echo ""
echo "Don't forget to:"
echo "  1. Edit .env file with your WorldID app ID and blockchain RPC URL"
echo "  2. Configure your PRIVATE_KEY if you want to send blockchain transactions"
