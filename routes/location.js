const express = require('express');
const router = express.Router();

// Location tracking service
const locationService = require('../services/locationService');

/**
 * GET /api/location/:taskId
 * Get location history for a task
 */
router.get('/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const history = locationService.getLocationHistory(taskId);

    if (history.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No location history found',
        message: `Task ${taskId} has no location history`
      });
    }

    res.json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location history',
      message: error.message
    });
  }
});

/**
 * GET /api/location/:taskId/current
 * Get current location for a task
 */
router.get('/:taskId/current', (req, res) => {
  try {
    const { taskId } = req.params;
    const location = locationService.getCurrentLocation(taskId);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'No current location found',
        message: `Task ${taskId} has no active tracking`
      });
    }

    res.json({
      success: true,
      data: location
    });

  } catch (error) {
    console.error('Error fetching current location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current location',
      message: error.message
    });
  }
});

/**
 * POST /api/location/:taskId/subscribe
 * Subscribe to location updates (WebSocket alternative using long polling)
 */
router.post('/:taskId/subscribe', (req, res) => {
  try {
    const { taskId } = req.params;
    const { lastTimestamp } = req.body;

    // Wait for new location update (max 30 seconds)
    const timeout = setTimeout(() => {
      res.json({
        success: true,
        data: null,
        message: 'No new updates'
      });
    }, 30000);

    // Check for updates every second
    const checkInterval = setInterval(() => {
      const location = locationService.getCurrentLocation(taskId);
      
      if (location && location.timestamp !== lastTimestamp) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        
        res.json({
          success: true,
          data: location,
          message: 'New location available'
        });
      }
    }, 1000);

  } catch (error) {
    console.error('Error in location subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to updates',
      message: error.message
    });
  }
});

module.exports = router;
