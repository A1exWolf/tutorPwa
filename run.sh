#!/bin/bash

# Setup colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Tutor Application...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker and try again.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose and try again.${NC}"
    exit 1
fi

# Build and start the services
echo -e "${BLUE}Building and starting services...${NC}"
docker-compose up -d --build

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 10

# Show status
echo -e "${GREEN}Services started successfully!${NC}"
echo -e "${GREEN}You can access the application at: http://localhost${NC}"
echo ""
echo -e "${BLUE}Running containers:${NC}"
docker-compose ps

echo ""
echo -e "${BLUE}To view logs, run:${NC} docker-compose logs -f"
echo -e "${BLUE}To stop the application, run:${NC} docker-compose down" 