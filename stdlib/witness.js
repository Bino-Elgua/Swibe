/**
 * stdlib/witness.js
 * Event logging and observation module
 */

import crypto from 'crypto';

export class WitnessModule {
  constructor() {
    this.events = [];
    this.observers = new Map();
    this.eventHash = null;
  }

  /**
   * Log an event
   * @param {string} eventType - Type of event
   * @param {object} data - Event data
   * @param {string} agent - Agent that triggered event
   */
  logEvent(eventType, data = {}, agent = 'system') {
    const event = {
      id: crypto.randomUUID(),
      type: eventType,
      data,
      agent,
      timestamp: Date.now(),
      blockHash: this._hashPreviousBlock()
    };
    
    this.events.push(event);
    this.eventHash = this._hashEvent(event);
    
    // Notify observers
    this._notifyObservers(eventType, event);
    
    return event;
  }

  /**
   * Register observer for event type
   * @param {string} eventType - Event type to observe
   * @param {function} callback - Function to call on event
   */
  observe(eventType, callback) {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }
    this.observers.get(eventType).push(callback);
  }

  /**
   * Remove observer
   * @param {string} eventType - Event type
   * @param {function} callback - Callback to remove
   */
  stopObserving(eventType, callback) {
    const callbacks = this.observers.get(eventType);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx > -1) callbacks.splice(idx, 1);
    }
  }

  /**
   * Get events matching filter
   * @param {object} filter - Filter criteria
   */
  getEvents(filter = {}) {
    let results = this.events;
    
    if (filter.type) {
      results = results.filter(e => e.type === filter.type);
    }
    if (filter.agent) {
      results = results.filter(e => e.agent === filter.agent);
    }
    if (filter.since) {
      results = results.filter(e => e.timestamp >= filter.since);
    }
    if (filter.limit) {
      results = results.slice(-filter.limit);
    }
    
    return results;
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   */
  getEvent(eventId) {
    return this.events.find(e => e.id === eventId);
  }

  /**
   * Get witness proof for event
   * @param {string} eventId - Event ID
   */
  getWitness(eventId) {
    const event = this.getEvent(eventId);
    if (!event) throw new Error(`Event not found: ${eventId}`);
    
    return {
      eventId: event.id,
      type: event.type,
      timestamp: event.timestamp,
      blockHash: event.blockHash,
      index: this.events.indexOf(event),
      proof: {
        hash: this._hashEvent(event),
        previousHash: this.events.length > 1 ? this._hashEvent(this.events[this.events.length - 2]) : null
      }
    };
  }

  /**
   * Evolve witness (trigger evolution event)
   * @param {string} evolutionType - Type of evolution
   * @param {object} metadata - Evolution metadata
   */
  evolve(evolutionType, metadata = {}) {
    return this.logEvent('evolution', {
      type: evolutionType,
      ...metadata
    });
  }

  /**
   * Get event statistics
   */
  getStats() {
    const eventTypes = {};
    const agents = {};
    
    this.events.forEach(e => {
      eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
      agents[e.agent] = (agents[e.agent] || 0) + 1;
    });
    
    return {
      totalEvents: this.events.length,
      eventTypes,
      agents,
      lastEventTime: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null
    };
  }

  /**
   * Internal: notify observers of event
   */
  _notifyObservers(eventType, event) {
    const callbacks = this.observers.get(eventType) || [];
    callbacks.forEach(cb => {
      try {
        cb(event);
      } catch (error) {
        console.error(`Observer error for ${eventType}:`, error);
      }
    });
  }

  /**
   * Internal: hash an event
   */
  _hashEvent(event) {
    const data = JSON.stringify({
      type: event.type,
      data: event.data,
      timestamp: event.timestamp
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Internal: hash of previous block
   */
  _hashPreviousBlock() {
    if (this.events.length === 0) return null;
    return this._hashEvent(this.events[this.events.length - 1]);
  }

  /**
   * Clear all events (for testing)
   */
  reset() {
    this.events = [];
    this.eventHash = null;
  }
}

export default new WitnessModule();
