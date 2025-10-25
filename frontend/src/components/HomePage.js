import React from 'react';
import ChatWindow from './ChatWindow';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <h1>Welcome to VenueGenie</h1>
          <p>Your intelligent venue management assistant</p>
        </div>
        
        <div className="content-grid">
          <div className="info-section">
            <h2>About VenueGenie</h2>
            <p>
              VenueGenie is an advanced venue management system that helps you 
              manage events, handle emergencies, and communicate with your team 
              in real-time.
            </p>
            <ul>
              <li>AI-powered chat assistant</li>
              <li>Emergency alert system</li>
              <li>Real-time dashboard monitoring</li>
              <li>Venue information and booking</li>
            </ul>
          </div>
          
          <div className="chat-section">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
