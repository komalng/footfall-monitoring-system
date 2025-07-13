# Local Setup Guide (No Docker Required)

This guide will help you set up the Mini Footfall Monitoring System on your local machine without Docker.

## Prerequisites

1. **Node.js 16+ and npm**
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **MongoDB** (Choose one option)
   - **Option A**: Install MongoDB Community Edition (see [MONGODB_SETUP.md](./MONGODB_SETUP.md))
   - **Option B**: Use MongoDB Atlas (cloud service - free tier available)
   - **Option C**: Use SQLite (requires code modifications)

## Quick Start

### Step 1: Clone or Download the Project
Make sure you have all the project files in your directory.

### Step 2: Install MongoDB (if not using Atlas)
Follow the instructions in [MONGODB_SETUP.md](./MONGODB_SETUP.md) to install MongoDB.

### Step 3: Run the Local Setup Script
```bash
# Make the script executable (if not already done)
chmod +x local-setup.sh

# Start all services
./local-setup.sh start
```

The script will:
- ✅ Check prerequisites (Node.js, npm)
- 📦 Install all dependencies
- 🗄️ Start MongoDB (if available)
- 🔌 Start the backend server
- ⚛️ Start the frontend application
- 📡 Start the simulator

### Step 4: Access Your Application
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Simulator
cd simulator
npm install
cd ..
```

### 2. Start MongoDB
```bash
# If using local MongoDB
mongod --dbpath ./data/db

# Or start as a service (macOS with Homebrew)
brew services start mongodb/brew/mongodb-community
```

### 3. Start Services (in separate terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Simulator:**
```bash
cd simulator
npm start
```

## Using MongoDB Atlas (Cloud Option)

If you don't want to install MongoDB locally:

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Update the backend configuration:

Edit `backend/src/server.js`:
```javascript
// Replace this line:
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/footfall';

// With your Atlas connection string:
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/footfall?retryWrites=true&w=majority';
```

## Useful Commands

### Local Setup Script Commands
```bash
./local-setup.sh start    # Start all services
./local-setup.sh stop     # Stop all services
./local-setup.sh restart  # Restart all services
./local-setup.sh health   # Check service health
./local-setup.sh logs     # Show service logs
./local-setup.sh clean    # Clean up and stop services
```

### Manual Commands
```bash
# Check if services are running
curl http://localhost:3000          # Frontend
curl http://localhost:5000/api/health  # Backend

# View logs
tail -f backend/logs/app.log        # Backend logs
# Frontend logs appear in the terminal where you started it
```

## Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Find process using port 3000 or 5000
lsof -i :3000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**2. MongoDB connection failed**
- Make sure MongoDB is running
- Check if the connection string is correct
- Verify MongoDB is accessible on port 27017

**3. Node modules not found**
```bash
# Reinstall dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd simulator && npm install && cd ..
```

**4. Permission denied**
```bash
# Make scripts executable
chmod +x local-setup.sh
chmod +x quick-start.sh
```

### Service Status Check
```bash
# Check if processes are running
ps aux | grep node

# Check specific ports
netstat -an | grep :3000
netstat -an | grep :5000
```

## Development Mode

For development with auto-reload:

```bash
# Backend (auto-reload on changes)
cd backend
npm run dev

# Frontend (auto-reload on changes)
cd frontend
npm start

# Simulator (auto-reload on changes)
cd simulator
npm run dev
```

## Stopping Services

### Using the Script
```bash
./local-setup.sh stop
```

### Manual Stop
```bash
# Find and kill Node.js processes
pkill -f "node.*backend"
pkill -f "node.*frontend"
pkill -f "node.*simulator"

# Or kill by PID (check .backend.pid, .frontend.pid, .simulator.pid files)
kill $(cat .backend.pid)
kill $(cat .frontend.pid)
kill $(cat .simulator.pid)
```

## Data Persistence

- **MongoDB data**: Stored in `./data/db/` (if using local MongoDB)
- **Application logs**: Stored in `backend/logs/`
- **Process IDs**: Stored in `.backend.pid`, `.frontend.pid`, `.simulator.pid`

## Next Steps

Once your system is running:

1. **Explore the Dashboard**: Visit http://localhost:3000
2. **Check API**: Visit http://localhost:5000/api/health
3. **Monitor Logs**: Use `./local-setup.sh logs`
4. **Test Simulator**: Data will be sent every hour automatically

## Need Help?

- Check the [MONGODB_SETUP.md](./MONGODB_SETUP.md) for MongoDB installation
- Review the main [README.md](./README.md) for project overview
- Check service logs for error messages
- Verify all prerequisites are installed correctly 