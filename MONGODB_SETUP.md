# MongoDB Setup Guide

Since you don't have Docker installed, you'll need to set up MongoDB locally. Here are several options:

## Option 1: Install MongoDB Community Edition (Recommended)

### macOS (using Homebrew)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

### macOS (Manual Installation)
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Extract the archive
3. Create a data directory: `mkdir -p /usr/local/var/mongodb`
4. Start MongoDB: `mongod --dbpath /usr/local/var/mongodb`

### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will be installed as a service and start automatically

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud Service - Free)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Update the backend configuration

### Update Backend Configuration for Atlas
Edit `backend/src/server.js` and change the MongoDB connection:

```javascript
// Replace this line:
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/footfall';

// With your Atlas connection string:
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/footfall?retryWrites=true&w=majority';
```

## Option 3: Use SQLite (Alternative Database)

If you prefer not to install MongoDB, you can modify the backend to use SQLite instead. This requires some code changes but is simpler to set up.

## Verification

After installing MongoDB, verify it's running:

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Or connect to the shell
mongosh
```

## Troubleshooting

### MongoDB won't start
- Check if the data directory exists and has proper permissions
- Check MongoDB logs: `/var/log/mongodb/mongod.log` (Linux) or `/usr/local/var/log/mongodb/mongo.log` (macOS)

### Connection refused
- Make sure MongoDB is running on the default port (27017)
- Check firewall settings
- Verify the connection string in the backend

### Permission denied
- Make sure you have write permissions to the data directory
- On macOS/Linux, you might need to run with sudo for the first time

## Next Steps

Once MongoDB is installed and running:

1. Run the local setup script:
   ```bash
   chmod +x local-setup.sh
   ./local-setup.sh start
   ```

2. The system will automatically:
   - Install all dependencies
   - Start the backend server
   - Start the frontend application
   - Start the simulator

3. Access your application at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Need Help?

If you encounter any issues:
1. Check the MongoDB documentation: https://docs.mongodb.com/
2. Verify your installation: `mongosh --version`
3. Check if the service is running: `brew services list` (macOS) or `systemctl status mongod` (Linux) 