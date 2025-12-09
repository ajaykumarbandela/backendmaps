# Backend Maps Service

Google Maps backend service for ExtraHand platform - handles real-time location tracking for deliveries.

## Features

- 📍 Real-time location tracking
- 🗺️ Location history management
- 🔄 RESTful API endpoints
- 📊 Active delivery monitoring
- 🧹 Automatic stale data cleanup
- 🔐 CORS configured for frontend

## Installation

```bash
cd backend_maps
npm install
```

## Environment Setup

Copy `.env` file and configure:

```env
PORT=5002
GOOGLE_MAPS_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000
```

## Running the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start at: `http://localhost:5002`

## API Endpoints

### Delivery Location Management

#### Update Location
```
POST /api/delivery/:taskId/location
Body: {
  "location": { "lat": 17.385, "lng": 78.4867 },
  "deliveryPersonId": "person123",
  "accuracy": 10
}
```

#### Get Current Location
```
GET /api/delivery/:taskId/location
```

#### Clear Location
```
DELETE /api/delivery/:taskId/location
```

#### Get Active Deliveries
```
GET /api/delivery/active
```

### Location History

#### Get Location History
```
GET /api/location/:taskId
```

#### Get Current Location
```
GET /api/location/:taskId/current
```

### Health Check

```
GET /health
```

## Architecture

```
backend_maps/
├── server.js              # Express server setup
├── routes/
│   ├── delivery.js        # Delivery location endpoints
│   └── location.js        # Location history endpoints
├── services/
│   └── locationService.js # Location tracking business logic
├── package.json
└── .env
```

## Integration with Frontend

Frontend should point to this backend for location APIs:

```javascript
// In frontend .env.local
NEXT_PUBLIC_MAPS_BACKEND_URL=http://localhost:5002
```

Update API calls:
```javascript
// Old: /api/delivery/${taskId}/location
// New: ${process.env.NEXT_PUBLIC_MAPS_BACKEND_URL}/api/delivery/${taskId}/location
```

## Production Considerations

- [ ] Replace in-memory storage with Redis/PostgreSQL
- [ ] Implement WebSocket for real-time updates
- [ ] Add authentication & authorization
- [ ] Implement rate limiting
- [ ] Add request validation with Joi/Zod
- [ ] Set up logging (Winston/Bunyan)
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Implement Google Distance Matrix API for ETA
- [ ] Add push notifications

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **CORS:** Enabled for frontend communication
- **Storage:** In-memory (Map) - upgrade to Redis/DB for production
- **API:** Google Maps JavaScript API

## License

ISC
