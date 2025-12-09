# Testing Backend Maps Service

## Quick Test

### 1. Start the server
```bash
cd backend_maps
npm start
```

You should see:
```
🗺️  Maps Backend Server Running
📍 Port: 5002
🌍 Environment: development
🔗 Frontend URL: http://localhost:3000
✅ Server ready at http://localhost:5002
```

### 2. Test Health Endpoint
Open browser: http://localhost:5002/health

Expected response:
```json
{
  "status": "healthy",
  "service": "backend_maps",
  "timestamp": "2025-12-09T...",
  "version": "1.0.0"
}
```

### 3. Test Location Update (POST)
```bash
curl -X POST http://localhost:5002/api/delivery/test-123/location \
  -H "Content-Type: application/json" \
  -d "{\"location\":{\"lat\":17.385,\"lng\":78.4867},\"deliveryPersonId\":\"person-1\"}"
```

Expected response:
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "taskId": "test-123",
    "deliveryPersonId": "person-1",
    "location": { "lat": 17.385, "lng": 78.4867 },
    "timestamp": "..."
  }
}
```

### 4. Test Get Location (GET)
```bash
curl http://localhost:5002/api/delivery/test-123/location
```

Expected response:
```json
{
  "success": true,
  "data": {
    "taskId": "test-123",
    "deliveryPersonId": "person-1",
    "location": { "lat": 17.385, "lng": 78.4867 },
    "timestamp": "..."
  }
}
```

### 5. Test Active Deliveries
```bash
curl http://localhost:5002/api/delivery/active
```

Expected response:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "taskId": "test-123",
      "deliveryPersonId": "person-1",
      "location": { "lat": 17.385, "lng": 78.4867 },
      "timestamp": "..."
    }
  ]
}
```

## PowerShell Testing

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:5002/health" | Select-Object -ExpandProperty Content

# Post location
$body = @{
    location = @{ lat = 17.385; lng = 78.4867 }
    deliveryPersonId = "person-1"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5002/api/delivery/test-123/location" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" | Select-Object -ExpandProperty Content

# Get location
Invoke-WebRequest -Uri "http://localhost:5002/api/delivery/test-123/location" | Select-Object -ExpandProperty Content
```

## Integration Test with Frontend

1. Start backend_maps: `cd backend_maps && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Open: http://localhost:3000/delivery-demo
4. Click "Start Delivery" on any task
5. Check browser console for location updates being sent
6. Open tracking view to see location displayed

## Troubleshooting

### Server won't start
- Check if port 5002 is already in use: `netstat -ano | findstr :5002`
- Verify .env file exists with PORT=5002
- Check node_modules installed: `npm install`

### Can't connect to API
- Verify server is running
- Check CORS settings in server.js
- Ensure NEXT_PUBLIC_MAPS_BACKEND_URL is set in frontend/.env.local

### Location updates not working
- Check browser console for errors
- Verify API URL in frontend code
- Test API directly with curl/Postman first
