#!/bin/bash

# Mini Footfall Monitoring System - Quick Start Script
# This script will set up and start the entire system

set -e

echo "🚀 Mini Footfall Monitoring System - Quick Start"
echo "================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Make is installed
if ! command -v make &> /dev/null; then
    echo "⚠️  Make is not installed. Using direct commands instead."
    USE_MAKE=false
else
    USE_MAKE=true
fi

echo "✅ Prerequisites check passed"

# Function to start services
start_services() {
    echo ""
    echo "🔨 Building and starting services..."
    
    if [ "$USE_MAKE" = true ]; then
        make build
        make simulator
    else
        docker-compose build
        docker-compose --profile simulator up -d
    fi
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Access your application:"
    echo "   📊 Frontend Dashboard: http://localhost:3000"
    echo "   🔌 Backend API:        http://localhost:5000"
    echo "   📡 API Documentation:  http://localhost:5000/api/health"
    echo ""
    echo "📡 Simulator is running and will send data every hour"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs:     docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart:       docker-compose restart"
    echo ""
}

# Function to check if services are running
check_services() {
    echo "🏥 Checking service health..."
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is running"
    else
        echo "❌ Frontend is not responding"
    fi
    
    # Check backend
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is running"
    else
        echo "❌ Backend is not responding"
    fi
    
    # Check MongoDB
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is running"
    else
        echo "❌ MongoDB is not responding"
    fi
}

# Main execution
case "${1:-start}" in
    "start")
        start_services
        check_services
        ;;
    "stop")
        echo "🛑 Stopping services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
    "restart")
        echo "🔄 Restarting services..."
        docker-compose down
        start_services
        check_services
        ;;
    "logs")
        echo "📋 Showing logs..."
        docker-compose logs -f
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        echo "✅ Cleanup completed"
        ;;
    "health")
        check_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|clean|health}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all services (default)"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  logs    - Show service logs"
        echo "  clean   - Clean up containers and volumes"
        echo "  health  - Check service health"
        exit 1
        ;;
esac 