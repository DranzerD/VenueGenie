# VenueGenie Ngrok Demo Setup

This guide will help you set up VenueGenie for a public demo using ngrok.

## Prerequisites

1. Install ngrok: https://ngrok.com/download
2. Sign up for a free ngrok account (optional, but recommended for custom domains)
3. VenueGenie backend and frontend installed and tested locally

## Setup Steps

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The backend will be running on `http://localhost:5000`

### 2. Start Ngrok Tunnel for Backend

In a new terminal:

```bash
ngrok http 5000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:5000
```

Copy the `https://` URL (e.g., `https://abc123.ngrok.io`)

### 3. Update Frontend Configuration

Edit `frontend/package.json` and update the proxy:

```json
{
  ...
  "proxy": "https://abc123.ngrok.io"
}
```

Or set it as an environment variable:

```bash
export REACT_APP_API_URL=https://abc123.ngrok.io
```

### 4. Start the Frontend

```bash
cd frontend
npm start
```

The frontend will be running on `http://localhost:3000`

### 5. Create Public Frontend Tunnel (Optional)

If you want to share the frontend publicly:

```bash
ngrok http 3000
```

## Alternative: Host Frontend on Backend

You can build and serve the frontend from the backend for a single ngrok tunnel:

### 1. Build Frontend

```bash
cd frontend
npm run build
```

### 2. Update Backend to Serve Frontend

Add to `backend/server.js`:

```javascript
// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
```

### 3. Start Backend and Ngrok

```bash
cd backend
npm start

# In another terminal
ngrok http 5000
```

Now everything is accessible through one ngrok URL!

## Demo Access Points

With ngrok running on your backend (e.g., `https://abc123.ngrok.io`):

- **Main Application**: `https://abc123.ngrok.io/` (if serving frontend from backend)
- **Dashboard**: `https://abc123.ngrok.io/dashboard`
- **Broadcast Display**: `https://abc123.ngrok.io/broadcast.html`
- **API Health**: `https://abc123.ngrok.io/api/health`
- **Alert Status**: `https://abc123.ngrok.io/api/alert-status`

## Tips for Demo

1. **Test Before Demo**: Always test the ngrok URLs before your demo
2. **Stable URLs**: With a paid ngrok account, you can get stable URLs that don't change
3. **HTTPS**: Ngrok provides HTTPS by default, which is great for demos
4. **Broadcast Display**: Open `broadcast.html` on a separate screen/projector to show real-time alerts
5. **Multiple Devices**: You can access the ngrok URL from any device with internet

## Demo Scenario

1. Open the dashboard on your device
2. Open broadcast.html on a projector/second screen
3. Report an emergency through the dashboard
4. Watch the broadcast display update in real-time
5. Use the chat assistant to answer questions about venues
6. Show the ambiance timeline feature

## Troubleshooting

### CORS Issues

If you encounter CORS issues, update `backend/server.js`:

```javascript
app.use(cors({
  origin: ['https://your-ngrok-url.ngrok.io', 'http://localhost:3000'],
  credentials: true
}));
```

### Connection Refused

- Ensure your backend is running before starting ngrok
- Check that the port (5000) is correct
- Verify no firewall is blocking the port

### Frontend Can't Connect to Backend

- Double-check the proxy setting in `frontend/package.json`
- Restart the frontend after changing proxy
- Clear browser cache if needed

## Security Notes

⚠️ **Important**: 
- Don't expose your production database through ngrok
- Use a demo database for public demos
- Consider using ngrok's password protection for sensitive demos
- Never commit your ngrok auth token to Git

## Ngrok Advanced Features

### Password Protection

```bash
ngrok http 5000 --auth="username:password"
```

### Custom Subdomain (Paid Plan)

```bash
ngrok http 5000 --subdomain=venuegenie-demo
```

### Configuration File

Create `~/.ngrok2/ngrok.yml`:

```yaml
authtoken: YOUR_AUTH_TOKEN
tunnels:
  backend:
    proto: http
    addr: 5000
    subdomain: venuegenie-backend
  frontend:
    proto: http
    addr: 3000
    subdomain: venuegenie-frontend
```

Then start with:

```bash
ngrok start --all
```

## Support

For issues with ngrok, visit: https://ngrok.com/docs
For VenueGenie issues, check the main README.md
