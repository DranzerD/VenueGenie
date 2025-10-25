# VenueGenie

VenueGenie is an intelligent venue management system with an AI-powered assistant, emergency alert system, and real-time dashboard monitoring.

## Features

- 🤖 **AI-Powered Chat Assistant**: Gemini AI integration with RAG (Retrieval Augmented Generation) for venue information
- 🚨 **Emergency Alert System**: Real-time emergency reporting and broadcasting
- 📊 **Real-Time Dashboard**: Monitor venue status and manage alerts
- 🎭 **Venue Ambiance Management**: Timeline-based ambiance control
- 📡 **Live Broadcasting**: Real-time alert broadcast display
- 🔌 **REST API**: Complete backend API for venue and alert management

## Project Structure

```
VenueGenie/
├── frontend/               # React frontend application
│   ├── public/
│   │   ├── index.html     # Main app entry point
│   │   └── broadcast.html # Broadcast display page
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── ChatWindow.js
│   │   │   └── ConfirmEmergency.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/                # Node.js/Express backend
│   ├── routes/
│   │   ├── chat.js        # Chat/AI endpoints
│   │   └── alerts.js      # Alert management endpoints
│   ├── config/
│   │   └── database.js    # MySQL configuration
│   ├── server.js
│   ├── schema.sql         # Database schema
│   └── package.json
├── data/                   # JSON data files
│   ├── venues.json        # Venue information
│   └── timeline.json      # Ambiance timeline data
└── package.json           # Root package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MySQL (optional, app works without it using in-memory storage)
- Google Gemini API Key (optional, app works with fallback responses)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DranzerD/VenueGenie.git
   cd VenueGenie
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure Backend**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your configuration
   ```

4. **Setup Database (Optional)**
   ```bash
   # Import the schema
   mysql -u root -p < backend/schema.sql
   ```

### Running the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

This runs:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

#### Run Separately

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

### Access Points

- **Main Application**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Broadcast Display**: http://localhost:3000/broadcast.html
- **API Health Check**: http://localhost:5000/api/health

## API Endpoints

### Chat/AI
- `POST /api/chat` - Send message to AI assistant
  ```json
  {
    "message": "Tell me about the Grand Hall",
    "history": []
  }
  ```

### Alert Management
- `POST /api/report` - Report an emergency
  ```json
  {
    "type": "fire",
    "description": "Fire detected in kitchen",
    "location": "Main Kitchen Area"
  }
  ```

- `POST /api/approve-alert/:id` - Approve/acknowledge an alert
- `GET /api/alert-status` - Get current active alert status
- `GET /api/alerts` - Get all alerts (admin)

### Static Data
- `GET /data/venues.json` - Get venue information
- `GET /data/timeline.json` - Get ambiance timeline data

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=venuegenie
GEMINI_API_KEY=your_gemini_api_key
```

## Features in Detail

### 1. React Frontend with Routing
- Home page (`/`) with AI chat assistant
- Dashboard page (`/dashboard`) with emergency controls
- React Router for navigation

### 2. AI Chat Assistant (ChatWindow Component)
- Gemini AI integration
- Intent classification (emergency, venue info, booking, events)
- RAG (Retrieval Augmented Generation) with venue data
- Fallback responses when API key is not configured

### 3. Emergency Management
- **ConfirmEmergency Component**: Modal for reporting emergencies
- Real-time alert status polling
- Alert approval/acknowledgment system

### 4. Dashboard (DashboardPage Component)
- Real-time alert monitoring
- Emergency reporting interface
- System status display
- Venue ambiance information from timeline.json

### 5. Broadcast Display
- Standalone HTML page for public display
- Auto-refreshing alert status
- Visual alert indicators with animations

### 6. Backend API
- Express.js server
- MySQL database support (with in-memory fallback)
- RESTful API design
- Error handling and logging

### 7. Timeline Ambiance Player
- Loads ambiance settings from `timeline.json`
- Displays current venue state
- Shows event timeline
- Configurable ambiance modes

## Ngrok Demo Setup

To expose your local development server for demo purposes:

1. Install ngrok: https://ngrok.com/download

2. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 5000
   ```

4. Update your frontend to use the ngrok URL, or configure CORS appropriately.

## Development Notes

- Frontend polls backend every 2 seconds for alert status updates
- Database is optional; the app uses in-memory storage as fallback
- Gemini API key is optional; the app provides fallback responses
- All components are styled with CSS modules for better organization

## Technologies Used

### Frontend
- React 18
- React Router DOM 6
- Axios for API calls
- CSS3 with animations

### Backend
- Node.js
- Express.js
- MySQL2
- Google Generative AI (Gemini)
- CORS & Body Parser

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.