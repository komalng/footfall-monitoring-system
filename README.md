# Mini Footfall Monitoring System

A real-time, cloud-based web application for monitoring foot traffic on public infrastructure using the MERN stack.

## 🚀 Features

- **Real-time Data Ingestion**: Accepts sensor data via RESTful APIs
- **Analytics Dashboard**: Visualizes footfall data with charts and summaries
- **Device Management**: Tracks sensor status and last seen timestamps
- **Interactive Map**: Shows sensor locations with mock GPS coordinates
- **Dockerized Deployment**: Easy local development and deployment

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- RESTful APIs for sensor data ingestion and analytics
- MongoDB for data persistence
- Real-time data processing
- Device status tracking

### Frontend (React + Tailwind CSS)
- Modern, responsive dashboard
- Real-time charts using Chart.js
- Interactive map using Leaflet
- Device status cards with live updates

### DevOps
- Docker containers for all services
- Docker Compose for local orchestration
- MongoDB container for data persistence

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Tailwind CSS, Chart.js, Leaflet
- **DevOps**: Docker, Docker Compose
- **Real-time**: WebSocket connections for live updates

## 📦 Installation & Setup

### Prerequisites

**For Docker Setup:**
- Docker and Docker Compose

**For Local Setup:**
- Node.js 16+ and npm
- MongoDB (optional - can use cloud service)

### 🐳 Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd footfall-monitoring-system

# Start all services
docker-compose up -d

# Or start with simulator
docker-compose --profile simulator up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### 💻 Local Setup (No Docker Required)

#### Option 1: Automatic Setup
```bash
# Clone the repository
git clone <repository-url>
cd footfall-monitoring-system

# Make script executable and start
chmod +x local-setup.sh
./local-setup.sh start
```

#### Option 2: Manual Setup
```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd simulator && npm install && cd ..

# Start MongoDB (if using local MongoDB)
mongod --dbpath ./data/db

# Start backend (in new terminal)
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm start

# Start simulator (in new terminal)
cd simulator && npm start
```

### 🗄️ MongoDB Setup

**Option A: Local MongoDB**
- Follow instructions in [MONGODB_SETUP.md](./MONGODB_SETUP.md)
- Or use Homebrew: `brew install mongodb-community`

**Option B: MongoDB Atlas (Cloud)**
- Free tier available at https://www.mongodb.com/atlas
- Update connection string in `backend/src/server.js`

**Option C: Use Docker MongoDB**
- Included in docker-compose.yml

### 🚀 Quick Commands

```bash
# Docker commands
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs

# Local commands
./local-setup.sh start            # Start all services
./local-setup.sh stop             # Stop all services
./local-setup.sh health           # Check health
./local-setup.sh logs             # View logs
./local-setup.sh restart          # Restart services
```

## 📊 API Endpoints

### Sensor Data
- `POST /api/sensor-data` - Accept footfall data from sensors
- `GET /api/sensor-data` - Get sensor data with filters
- `GET /api/sensor-data/:sensor_id` - Get specific sensor data

### Analytics
- `GET /api/analytics` - Get aggregated footfall data (hourly/daily)
- `GET /api/analytics/realtime` - Get real-time data for charts
- `GET /api/analytics/summary` - Get summary statistics

### Devices
- `GET /api/devices` - List all devices with status
- `GET /api/devices/:sensor_id` - Get specific device details
- `POST /api/devices` - Create or update device
- `PUT /api/devices/:sensor_id/status` - Update device status
- `GET /api/devices/status/summary` - Get device status summary

### Health Check
- `GET /api/health` - System health status

### Payload Format
```json
{
  "sensor_id": "sensor_001",
  "timestamp": "2024-01-15T10:30:00Z",
  "count": 25
}
```

## 🎯 Key Features

### Real-time Dashboard
- Live footfall charts for the past hour
- Daily footfall summaries per sensor
- Device status monitoring
- Interactive map with sensor locations
- Real-time WebSocket updates

### Data Analytics
- Hourly and daily aggregations
- Device activity tracking
- Historical data visualization
- Export capabilities

### Device Management
- Real-time status updates
- Last seen timestamps
- Inactive device detection
- Battery level monitoring
- Firmware version tracking

### Modern UI/UX
- Responsive design with Tailwind CSS
- Professional color scheme
- Interactive charts and maps
- Real-time indicators and animations

## 🔧 Configuration

### Environment Variables
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/footfall
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:5000/api

# Simulator
API_BASE_URL=http://localhost:5000/api
```

### MongoDB Connection Options
- **Local MongoDB**: `mongodb://localhost:27017/footfall`
- **MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/footfall`
- **Docker MongoDB**: `mongodb://admin:password123@mongodb:27017/footfall?authSource=admin`

## 🚀 Production Scaling Considerations

### High Availability
- **Load Balancing**: Use Nginx or AWS ALB for traffic distribution
- **Auto-scaling**: Implement horizontal scaling based on CPU/memory metrics
- **Database Clustering**: MongoDB replica sets for read/write separation

### Performance Optimization
- **Caching**: Redis for frequently accessed analytics data
- **Database Indexing**: Optimize MongoDB queries with proper indexes
- **CDN**: Serve static assets through CloudFront or similar

### Monitoring & Observability
- **Logging**: Centralized logging with ELK stack
- **Metrics**: Prometheus + Grafana for system monitoring
- **APM**: Application performance monitoring with New Relic or DataDog

### Security
- **Authentication**: JWT-based user authentication
- **API Rate Limiting**: Prevent abuse with rate limiting
- **HTTPS**: SSL/TLS encryption for all communications
- **Input Validation**: Sanitize all user inputs

### Data Management
- **Backup Strategy**: Automated MongoDB backups
- **Data Retention**: Implement data archival policies
- **Partitioning**: Time-based data partitioning for large datasets

## 📁 Project Structure

```
footfall-monitoring-system/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   ├── Dockerfile          # Docker configuration
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── App.js         # Main app component
│   ├── Dockerfile          # Docker configuration
│   ├── nginx.conf          # Nginx configuration
│   └── package.json
├── simulator/              # Sensor data simulator
│   ├── simulator.js        # Main simulator file
│   ├── Dockerfile          # Docker configuration
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── local-setup.sh         # Local setup script (no Docker)
├── quick-start.sh         # Quick start script
├── Makefile               # Project management
├── mongo-init.js          # MongoDB initialization
├── MONGODB_SETUP.md       # MongoDB installation guide
├── LOCAL_SETUP.md         # Local setup guide
└── README.md              # This file
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Or use the setup script
./local-setup.sh health
```

## 📈 Future Enhancements

- **Machine Learning**: Predictive analytics for footfall patterns
- **Mobile App**: React Native app for field monitoring
- **Advanced Analytics**: Heat maps and trend analysis
- **Alert System**: Notifications for unusual activity
- **Multi-tenant**: Support for multiple organizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📚 Additional Documentation

- [Local Setup Guide](./LOCAL_SETUP.md) - Detailed local setup instructions
- [MongoDB Setup Guide](./MONGODB_SETUP.md) - MongoDB installation and configuration
- [Docker Setup](./docker-compose.yml) - Container orchestration
- [API Documentation](./backend/src/routes/) - Backend API endpoints

## 📄 License

This project is licensed under the MIT License. 