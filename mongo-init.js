// MongoDB initialization script
db = db.getSiblingDB('footfall');

// Create collections with validation
db.createCollection('sensordata', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sensor_id", "timestamp", "count"],
      properties: {
        sensor_id: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        timestamp: {
          bsonType: "date",
          description: "must be a date and is required"
        },
        count: {
          bsonType: "number",
          minimum: 0,
          description: "must be a non-negative number and is required"
        },
        location: {
          bsonType: "object",
          properties: {
            type: {
              bsonType: "string",
              enum: ["Point"]
            },
            coordinates: {
              bsonType: "array",
              items: {
                bsonType: "number"
              }
            }
          }
        }
      }
    }
  }
});

db.createCollection('devices', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sensor_id", "name"],
      properties: {
        sensor_id: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        status: {
          bsonType: "string",
          enum: ["active", "inactive", "maintenance"]
        },
        last_seen: {
          bsonType: "date"
        },
        battery_level: {
          bsonType: "number",
          minimum: 0,
          maximum: 100
        },
        firmware_version: {
          bsonType: "string"
        },
        installation_date: {
          bsonType: "date"
        },
        description: {
          bsonType: "string"
        },
        location: {
          bsonType: "object",
          properties: {
            type: {
              bsonType: "string",
              enum: ["Point"]
            },
            coordinates: {
              bsonType: "array",
              items: {
                bsonType: "number"
              }
            }
          }
        }
      }
    }
  }
});

// Create indexes for better performance
db.sensordata.createIndex({ "sensor_id": 1, "timestamp": -1 });
db.sensordata.createIndex({ "timestamp": 1 });
db.sensordata.createIndex({ "location": "2dsphere" });

db.devices.createIndex({ "sensor_id": 1 }, { unique: true });
db.devices.createIndex({ "status": 1 });
db.devices.createIndex({ "last_seen": -1 });
db.devices.createIndex({ "location": "2dsphere" });

print('✅ MongoDB initialization completed');
print('📊 Collections created: sensordata, devices');
print('🔍 Indexes created for optimal performance'); 