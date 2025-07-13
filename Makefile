.PHONY: help install build start stop clean logs test

# Default target
help:
	@echo "🚀 Mini Footfall Monitoring System"
	@echo ""
	@echo "Available commands:"
	@echo "  install    - Install all dependencies"
	@echo "  build      - Build all Docker containers"
	@echo "  start      - Start all services"
	@echo "  stop       - Stop all services"
	@echo "  restart    - Restart all services"
	@echo "  clean      - Remove all containers and volumes"
	@echo "  logs       - Show logs from all services"
	@echo "  test       - Run tests"
	@echo "  simulator  - Start with simulator"
	@echo "  dev        - Start in development mode"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install
	cd simulator && npm install
	@echo "✅ Dependencies installed"

# Build Docker containers
build:
	@echo "🔨 Building Docker containers..."
	docker-compose build
	@echo "✅ Containers built"

# Start all services
start:
	@echo "🚀 Starting services..."
	docker-compose up -d
	@echo "✅ Services started"
	@echo "📊 Frontend: http://localhost:3000"
	@echo "🔌 Backend:  http://localhost:5000"
	@echo "🗄️  MongoDB:  localhost:27017"

# Start with simulator
simulator:
	@echo "🚀 Starting services with simulator..."
	docker-compose --profile simulator up -d
	@echo "✅ Services started with simulator"
	@echo "📊 Frontend: http://localhost:3000"
	@echo "🔌 Backend:  http://localhost:5000"
	@echo "🗄️  MongoDB:  localhost:27017"
	@echo "📡 Simulator: Running (sends data every hour)"

# Stop all services
stop:
	@echo "🛑 Stopping services..."
	docker-compose down
	@echo "✅ Services stopped"

# Restart all services
restart:
	@echo "🔄 Restarting services..."
	docker-compose restart
	@echo "✅ Services restarted"

# Clean up everything
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed"

# Show logs
logs:
	@echo "📋 Showing logs..."
	docker-compose logs -f

# Development mode
dev:
	@echo "🔧 Starting in development mode..."
	@echo "📦 Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install
	cd simulator && npm install
	@echo "🚀 Starting MongoDB..."
	docker-compose up -d mongodb
	@echo "⏳ Waiting for MongoDB..."
	sleep 10
	@echo "🔌 Starting backend..."
	cd backend && npm run dev &
	@echo "⚛️  Starting frontend..."
	cd frontend && npm start &
	@echo "📡 Starting simulator..."
	cd simulator && npm start &
	@echo "✅ Development environment started"
	@echo "📊 Frontend: http://localhost:3000"
	@echo "🔌 Backend:  http://localhost:5000"
	@echo "🗄️  MongoDB:  localhost:27017"

# Run tests
test:
	@echo "🧪 Running tests..."
	cd backend && npm test
	cd frontend && npm test
	@echo "✅ Tests completed"

# Health check
health:
	@echo "🏥 Checking service health..."
	@echo "Frontend:"
	curl -f http://localhost:3000 || echo "❌ Frontend not responding"
	@echo "Backend:"
	curl -f http://localhost:5000/api/health || echo "❌ Backend not responding"
	@echo "MongoDB:"
	docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" || echo "❌ MongoDB not responding" 