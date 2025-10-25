const express = require('express');
const router = express.Router();
const db = require('../config/database');

// In-memory storage for alerts (fallback if database is not available)
let alerts = [];
let alertIdCounter = 1;

// POST /api/report - Report an emergency
router.post('/report', async (req, res) => {
  try {
    const { type, description, location, timestamp } = req.body;
    
    if (!type || !description || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, description, location' 
      });
    }

    const alertData = {
      id: alertIdCounter++,
      type,
      description,
      location,
      timestamp: timestamp || new Date().toISOString(),
      status: 'active',
      approved: false
    };

    try {
      // Try to insert into database
      const [result] = await db.execute(
        'INSERT INTO alerts (type, description, location, timestamp, status, approved) VALUES (?, ?, ?, ?, ?, ?)',
        [type, description, location, alertData.timestamp, 'active', false]
      );
      alertData.id = result.insertId;
    } catch (dbError) {
      console.log('Database not available, using in-memory storage');
      // Use in-memory storage as fallback
    }

    alerts.push(alertData);

    console.log(`Emergency reported: ${type} at ${location}`);

    res.status(201).json({ 
      message: 'Emergency alert created successfully',
      alert: alertData
    });

  } catch (error) {
    console.error('Error reporting emergency:', error);
    res.status(500).json({ 
      error: 'Failed to report emergency',
      message: error.message
    });
  }
});

// POST /api/approve-alert/:id - Approve/acknowledge an alert
router.post('/approve-alert/:id', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    
    if (isNaN(alertId)) {
      return res.status(400).json({ error: 'Invalid alert ID' });
    }

    try {
      // Try to update in database
      await db.execute(
        'UPDATE alerts SET approved = TRUE, status = ? WHERE id = ?',
        ['acknowledged', alertId]
      );
    } catch (dbError) {
      console.log('Database not available, updating in-memory storage');
    }

    // Update in-memory storage
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.approved = true;
      alert.status = 'acknowledged';
    }

    console.log(`Alert ${alertId} approved/acknowledged`);

    res.json({ 
      message: 'Alert approved successfully',
      alertId
    });

  } catch (error) {
    console.error('Error approving alert:', error);
    res.status(500).json({ 
      error: 'Failed to approve alert',
      message: error.message
    });
  }
});

// GET /api/alert-status - Get current alert status
router.get('/alert-status', async (req, res) => {
  try {
    let activeAlert = null;

    try {
      // Try to fetch from database
      const [rows] = await db.execute(
        'SELECT * FROM alerts WHERE status = ? ORDER BY timestamp DESC LIMIT 1',
        ['active']
      );
      if (rows.length > 0) {
        activeAlert = rows[0];
      }
    } catch (dbError) {
      console.log('Database not available, using in-memory storage');
      // Use in-memory storage as fallback
      const activeAlerts = alerts.filter(a => a.status === 'active');
      if (activeAlerts.length > 0) {
        activeAlert = activeAlerts[activeAlerts.length - 1];
      }
    }

    if (activeAlert) {
      res.json({
        activeAlert: true,
        alertId: activeAlert.id,
        type: activeAlert.type,
        message: `${activeAlert.type.toUpperCase()}: ${activeAlert.description}`,
        location: activeAlert.location,
        timestamp: activeAlert.timestamp,
        approved: activeAlert.approved || false
      });
    } else {
      res.json({
        activeAlert: false,
        message: 'No active alerts'
      });
    }

  } catch (error) {
    console.error('Error fetching alert status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch alert status',
      message: error.message
    });
  }
});

// GET /api/alerts - Get all alerts (bonus endpoint for admin)
router.get('/alerts', async (req, res) => {
  try {
    let allAlerts = [];

    try {
      // Try to fetch from database
      const [rows] = await db.execute(
        'SELECT * FROM alerts ORDER BY timestamp DESC'
      );
      allAlerts = rows;
    } catch (dbError) {
      console.log('Database not available, using in-memory storage');
      allAlerts = [...alerts].reverse();
    }

    res.json({ alerts: allAlerts });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
});

module.exports = router;
