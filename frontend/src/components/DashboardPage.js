import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmEmergency from './ConfirmEmergency';
import './DashboardPage.css';

function DashboardPage() {
  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [ambiance, setAmbiance] = useState(null);

  // Poll for alert status
  useEffect(() => {
    const fetchAlertStatus = async () => {
      try {
        const response = await axios.get('/api/alert-status');
        setCurrentAlert(response.data.activeAlert ? response.data : null);
      } catch (error) {
        console.error('Error fetching alert status:', error);
      }
    };

    fetchAlertStatus();
    const interval = setInterval(fetchAlertStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Load ambiance data from timeline.json
  useEffect(() => {
    const loadAmbiance = async () => {
      try {
        const response = await axios.get('/data/timeline.json');
        setAmbiance(response.data);
      } catch (error) {
        console.error('Error loading ambiance data:', error);
      }
    };

    loadAmbiance();
  }, []);

  const handleReportEmergency = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmEmergency = async (emergencyData) => {
    try {
      await axios.post('/api/report', emergencyData);
      setShowConfirmDialog(false);
      // Refresh alert status
      const response = await axios.get('/api/alert-status');
      setCurrentAlert(response.data.activeAlert ? response.data : null);
    } catch (error) {
      console.error('Error reporting emergency:', error);
      alert('Failed to report emergency. Please try again.');
    }
  };

  const handleApproveAlert = async (alertId) => {
    try {
      await axios.post(`/api/approve-alert/${alertId}`);
      // Refresh alert status
      const response = await axios.get('/api/alert-status');
      setCurrentAlert(response.data.activeAlert ? response.data : null);
    } catch (error) {
      console.error('Error approving alert:', error);
      alert('Failed to approve alert. Please try again.');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 className="dashboard-title">VenueGenie Dashboard</h1>
        
        {currentAlert && (
          <div className="alert-notification active">
            <div className="alert-icon">🚨</div>
            <div className="alert-content">
              <h3>Active Emergency Alert</h3>
              <p>{currentAlert.message}</p>
              <p className="alert-meta">Type: {currentAlert.type}</p>
              {currentAlert.alertId && (
                <button 
                  className="btn btn-approve"
                  onClick={() => handleApproveAlert(currentAlert.alertId)}
                >
                  Acknowledge Alert
                </button>
              )}
            </div>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Emergency Control</h2>
            <p>Report and manage emergency situations</p>
            <button 
              className="btn btn-emergency"
              onClick={handleReportEmergency}
            >
              Report Emergency
            </button>
          </div>

          <div className="dashboard-card">
            <h2>System Status</h2>
            <div className="status-indicator">
              <span className={`status-dot ${currentAlert ? 'alert' : 'ok'}`}></span>
              <span className="status-text">
                {currentAlert ? 'Emergency Active' : 'All Systems Operational'}
              </span>
            </div>
          </div>

          {ambiance && (
            <div className="dashboard-card ambiance-card">
              <h2>Venue Ambiance</h2>
              <div className="ambiance-info">
                <p><strong>Current Setting:</strong> {ambiance.current || 'Normal'}</p>
                {ambiance.description && <p>{ambiance.description}</p>}
                {ambiance.events && ambiance.events.length > 0 && (
                  <div className="ambiance-events">
                    <h3>Recent Events</h3>
                    <ul>
                      {ambiance.events.map((event, idx) => (
                        <li key={idx}>
                          {event.time}: {event.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button className="btn btn-secondary">View Broadcast</button>
              <button className="btn btn-secondary">System Logs</button>
              <button className="btn btn-secondary">Settings</button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <ConfirmEmergency
          onConfirm={handleConfirmEmergency}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
}

export default DashboardPage;
