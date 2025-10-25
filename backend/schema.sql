-- VenueGenie Database Schema

CREATE DATABASE IF NOT EXISTS venuegenie;
USE venuegenie;

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  timestamp DATETIME NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_timestamp (timestamp)
);

-- Venues table (optional, for dynamic venue management)
CREATE TABLE IF NOT EXISTS venues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  features JSON,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table (optional, for event management)
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venue_id INT,
  name VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL,
  INDEX idx_start_time (start_time),
  INDEX idx_status (status)
);

-- Insert sample venues (optional)
INSERT INTO venues (name, capacity, features, description) VALUES
  ('Grand Hall', 500, '["Stage", "Sound System", "Lighting", "Air Conditioning"]', 'Our largest venue perfect for concerts, conferences, and large gatherings'),
  ('Conference Room A', 50, '["Projector", "Whiteboard", "Video Conferencing", "WiFi"]', 'Ideal for business meetings and presentations'),
  ('Banquet Hall', 200, '["Kitchen Access", "Tables & Chairs", "Dance Floor", "Bar Area"]', 'Perfect for weddings, parties, and social events'),
  ('Outdoor Garden', 150, '["Natural Lighting", "Garden Setting", "Covered Area", "Parking"]', 'Beautiful outdoor space for ceremonies and receptions')
ON DUPLICATE KEY UPDATE name=name;
