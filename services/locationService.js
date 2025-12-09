/**
 * Location Tracking Service
 * Manages real-time location tracking for delivery tasks
 */

class LocationTrackingService {
  constructor() {
    // Current locations
    this.currentLocations = new Map();
    
    // Location history (last 100 points per task)
    this.locationHistory = new Map();
    
    // Subscribers for real-time updates
    this.subscribers = new Map();
    
    // Maximum history entries per task
    this.maxHistorySize = 100;
  }

  /**
   * Update location for a task
   */
  updateLocation(taskId, locationData) {
    const location = {
      ...locationData,
      timestamp: new Date().toISOString(),
      updatedAt: Date.now()
    };

    // Update current location
    this.currentLocations.set(taskId, location);

    // Add to history
    if (!this.locationHistory.has(taskId)) {
      this.locationHistory.set(taskId, []);
    }
    
    const history = this.locationHistory.get(taskId);
    history.push(location);

    // Keep only last N entries
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    // Notify subscribers
    this.notifySubscribers(taskId, location);

    return location;
  }

  /**
   * Get current location for a task
   */
  getCurrentLocation(taskId) {
    return this.currentLocations.get(taskId) || null;
  }

  /**
   * Get location history for a task
   */
  getLocationHistory(taskId) {
    return this.locationHistory.get(taskId) || [];
  }

  /**
   * Clear location data for a task
   */
  clearLocation(taskId) {
    this.currentLocations.delete(taskId);
    this.locationHistory.delete(taskId);
    this.subscribers.delete(taskId);
  }

  /**
   * Subscribe to location updates for a task
   */
  subscribe(taskId, callback) {
    if (!this.subscribers.has(taskId)) {
      this.subscribers.set(taskId, new Set());
    }
    
    this.subscribers.get(taskId).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(taskId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(taskId);
        }
      }
    };
  }

  /**
   * Notify all subscribers of a location update
   */
  notifySubscribers(taskId, location) {
    const callbacks = this.subscribers.get(taskId);
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach(callback => {
        try {
          callback(location);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  /**
   * Get all active deliveries
   */
  getActiveDeliveries() {
    const active = [];
    
    this.currentLocations.forEach((location, taskId) => {
      active.push({
        taskId,
        location: location.location,
        timestamp: location.timestamp,
        age: Math.floor((Date.now() - location.updatedAt) / 1000)
      });
    });

    return active;
  }

  /**
   * Clean up stale locations (older than 1 hour)
   */
  cleanupStaleLocations() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    this.currentLocations.forEach((location, taskId) => {
      if (location.updatedAt < oneHourAgo) {
        console.log(`🧹 Cleaning up stale location for task ${taskId}`);
        this.clearLocation(taskId);
      }
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // km
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      activeDeliveries: this.currentLocations.size,
      totalHistoryEntries: Array.from(this.locationHistory.values())
        .reduce((sum, history) => sum + history.length, 0),
      subscribers: this.subscribers.size
    };
  }
}

// Singleton instance
const locationService = new LocationTrackingService();

// Cleanup stale locations every 15 minutes
setInterval(() => {
  locationService.cleanupStaleLocations();
}, 15 * 60 * 1000);

module.exports = locationService;
