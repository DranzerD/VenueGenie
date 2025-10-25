import React, { useState } from 'react';
import './ConfirmEmergency.css';

function ConfirmEmergency({ onConfirm, onCancel }) {
  const [emergencyType, setEmergencyType] = useState('fire');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!description.trim() || !location.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    onConfirm({
      type: emergencyType,
      description: description.trim(),
      location: location.trim(),
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>⚠️ Report Emergency</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-group">
            <label htmlFor="emergency-type">Emergency Type:</label>
            <select
              id="emergency-type"
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="form-control"
            >
              <option value="fire">Fire</option>
              <option value="medical">Medical Emergency</option>
              <option value="security">Security Threat</option>
              <option value="evacuation">Evacuation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Hall, Section A"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the emergency..."
              className="form-control"
              rows="4"
              required
            />
          </div>

          <div className="warning-message">
            ⚠️ This will trigger an emergency alert. Please ensure this is a genuine emergency.
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-confirm">
              Confirm Emergency Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfirmEmergency;
