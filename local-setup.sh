#!/bin/bash

# Mini Footfall Monitoring System - Local Setup Script
# This script sets up the system without Docker

set -e

echo "🚀 Mini Footfall Monitoring System - Local Setup"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo "📦 Node.js version: $(node -v)"
echo "📦 npm version: $(npm -v)"

# Function to install dependencies
install_dependencies() {
    echo ""
    echo "📦 Installing dependencies..."
    
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    echo "Installing simulator dependencies..."
    cd simulator && npm install && cd ..
    
    echo "✅ All dependencies installed"
}

# Function to start MongoDB (if available)
start_mongodb() {
    echo ""
    echo "🗄️  Checking MongoDB..."
    
    if command -v mongod &> /dev/null; then
        echo "✅ MongoDB found, starting..."
        # Start MongoDB in background
        mongod --dbpath ./data/db &
        MONGO_PID=$!
        echo "MongoDB started with PID: $MONGO_PID"
        echo $MONGO_PID > .mongodb.pid
        sleep 5
    else
        echo "⚠️  MongoDB not found. You'll need to install and start MongoDB manually."
        echo "   Download from: https://www.mongodb.com/try/download/community"
        echo "   Or use MongoDB Atlas (cloud service)"
        echo ""
        echo "For now, we'll continue with the setup..."
    fi
}

# Function to start services
start_services() {
    echo ""
    echo "🚀 Starting services..."
    
    # Start backend
    echo "🔌 Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../.backend.pid
    cd ..
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    sleep 10
    
    # Start frontend
    echo "⚛️  Starting frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    cd ..
    
    # Start simulator
    echo "📡 Starting simulator..."
    cd simulator
    npm start &
    SIMULATOR_PID=$!
    echo $SIMULATOR_PID > ../.simulator.pid
    cd ..
    
    echo ""
    echo "✅ All services started!"
    echo ""
    echo "🌐 Access your application:"
    echo "   📊 Frontend Dashboard: http://localhost:3000"
    echo "   🔌 Backend API:        http://localhost:5000"
    echo "   📡 API Health Check:   http://localhost:5000/api/health"
    echo ""
    echo "📡 Simulator is running and will send data every hour"
    echo ""
    echo "🔧 Process IDs:"
    echo "   Backend:   $BACKEND_PID"
    echo "   Frontend:  $FRONTEND_PID"
    echo "   Simulator: $SIMULATOR_PID"
    if [ ! -z "$MONGO_PID" ]; then
        echo "   MongoDB:  $MONGO_PID"
    fi
    echo ""
    echo "💡 To stop all services, run: ./local-setup.sh stop"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services..."
    
    # Stop backend
    if [ -f .backend.pid ]; then
        BACKEND_PID=$(cat .backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            echo "✅ Backend stopped"
        fi
        rm .backend.pid
    fi
    
    # Stop frontend
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo "✅ Frontend stopped"
        fi
        rm .frontend.pid
    fi
    
    # Stop simulator
    if [ -f .simulator.pid ]; then
        SIMULATOR_PID=$(cat .simulator.pid)
        if kill -0 $SIMULATOR_PID 2>/dev/null; then
            kill $SIMULATOR_PID
            echo "✅ Simulator stopped"
        fi
        rm .simulator.pid
    fi
    
    # Stop MongoDB
    if [ -f .mongodb.pid ]; then
        MONGO_PID=$(cat .mongodb.pid)
        if kill -0 $MONGO_PID 2>/dev/null; then
            kill $MONGO_PID
            echo "✅ MongoDB stopped"
        fi
        rm .mongodb.pid
    fi
    
    echo "✅ All services stopped"
}

# Function to check service health
check_health() {
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
    
    # Check if processes are running
    if [ -f .backend.pid ] && kill -0 $(cat .backend.pid) 2>/dev/null; then
        echo "✅ Backend process is running"
    else
        echo "❌ Backend process is not running"
    fi
    
    if [ -f .frontend.pid ] && kill -0 $(cat .frontend.pid) 2>/dev/null; then
        echo "✅ Frontend process is running"
    else
        echo "❌ Frontend process is not running"
    fi
    
    if [ -f .simulator.pid ] && kill -0 $(cat .simulator.pid) 2>/dev/null; then
        echo "✅ Simulator process is running"
    else
        echo "❌ Simulator process is not running"
    fi
}

# Function to show logs
show_logs() {
    echo "📋 Service logs will appear here. Press Ctrl+C to stop."
    echo ""
    echo "Backend logs:"
    tail -f backend/logs/app.log 2>/dev/null || echo "No backend logs found"
}

# Main execution
case "${1:-start}" in
    "install")
        install_dependencies
        ;;
    "start")
        install_dependencies
        start_mongodb
        start_services
        check_health
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        start_mongodb
        start_services
        check_health
        ;;
    "logs")
        show_logs
        ;;
    "health")
        check_health
        ;;
    "clean")
        echo "🧹 Cleaning up..."
        stop_services
        rm -f .*.pid
        rm -rf data/
        echo "✅ Cleanup completed"
        ;;
    *)
        echo "Usage: $0 {install|start|stop|restart|logs|health|clean}"
        echo ""
        echo "Commands:"
        echo "  install  - Install dependencies only"
        echo "  start    - Install dependencies and start all services (default)"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show service logs"
        echo "  health   - Check service health"
        echo "  clean    - Stop services and clean up"
        echo ""
        echo "Prerequisites:"
        echo "  - Node.js 16+ and npm"
        echo "  - MongoDB (optional, will be installed if available)"
        exit 1
        ;;
esac 