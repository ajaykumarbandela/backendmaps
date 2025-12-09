const express = require('express');
const router = express.Router();

// In-memory storage for demo (use Redis or Database in production)
const deliveryLocations = new Map();

/**
 * POST /api/delivery/:taskId/location
 * Update delivery person's location
 */
router.post('/:taskId/location', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { location, deliveryPersonId, accuracy } = req.body;

    // Validate location data
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid location data. Required: { lat: number, lng: number }'
      });
    }

    // Validate coordinates range
    if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Lat must be [-90, 90], Lng must be [-180, 180]'
      });
    }

    // Store location with timestamp
    const locationData = {
      taskId,
      deliveryPersonId: deliveryPersonId || 'unknown',
      location: {
        lat: location.lat,
        lng: location.lng
      },
      accuracy: accuracy || null,
      timestamp: new Date().toISOString(),
      updatedAt: Date.now()
    };

    deliveryLocations.set(taskId, locationData);

    // Log update
    console.log(`📍 Location updated for task ${taskId}:`, {
      lat: location.lat.toFixed(6),
      lng: location.lng.toFixed(6),
      accuracy: accuracy ? `${accuracy}m` : 'N/A'
    });

    // TODO for production:
    // - Save to database (PostgreSQL/MongoDB)
    // - Broadcast via WebSocket to connected clients
    // - Send push notification to customer
    // - Calculate ETA using Google Distance Matrix API
    // - Update delivery status if reached destination
    // - Log to analytics

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: locationData
    });

  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location',
      message: error.message
    });
  }
});

/**
 * GET /api/delivery/:taskId/location
 * Get current location of delivery person
 */
router.get('/:taskId/location', async (req, res) => {
  try {
    const { taskId } = req.params;
    const locationData = deliveryLocations.get(taskId);

    if (!locationData) {
      return res.status(404).json({
        success: false,
        error: 'No location data found for this delivery',
        message: `Task ${taskId} has no active tracking`
      });
    }

    // Check if location is stale (older than 5 minutes)
    const age = Date.now() - locationData.updatedAt;
    const isStale = age > 5 * 60 * 1000;

    res.json({
      success: true,
      data: locationData,
      meta: {
        age: Math.floor(age / 1000), // seconds
        isStale
      }
    });

  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location',
      message: error.message
    });
  }
});

/**
 * DELETE /api/delivery/:taskId/location
 * Clear location data when delivery is completed
 */
router.delete('/:taskId/location', async (req, res) => {
  try {
    const { taskId } = req.params;
    const existed = deliveryLocations.has(taskId);

    if (existed) {
      deliveryLocations.delete(taskId);
      console.log(`🗑️  Cleared location data for task ${taskId}`);
    }

    res.json({
      success: true,
      message: existed ? 'Location data cleared' : 'No data to clear',
      deleted: existed
    });

  } catch (error) {
    console.error('Error clearing location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear location',
      message: error.message
    });
  }
});

/**
 * GET /api/delivery/active
 * Get all active deliveries being tracked
 */
router.get('/active', (req, res) => {
  try {
    const activeDeliveries = Array.from(deliveryLocations.entries()).map(([taskId, data]) => ({
      taskId,
      deliveryPersonId: data.deliveryPersonId,
      location: data.location,
      timestamp: data.timestamp,
      age: Math.floor((Date.now() - data.updatedAt) / 1000)
    }));

    res.json({
      success: true,
      count: activeDeliveries.length,
      data: activeDeliveries
    });

  } catch (error) {
    console.error('Error fetching active deliveries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active deliveries',
      message: error.message
    });
  }
});

module.exports = router;
