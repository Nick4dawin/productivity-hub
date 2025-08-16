# Life OS Deployment Guide

## Health Endpoint Setup for Cold Start Prevention

### 1. Health Endpoint

The backend includes a health check endpoint at `/health` that returns server status information. This endpoint is designed to prevent cold starts on hosting platforms like Render.

### 2. Setting up Cron Job Monitoring

To prevent your Render backend from going to sleep, set up a cron job at [cron-job.org](https://cron-job.org):

1. Go to [cron-job.org](https://cron-job.org)
2. Create a new cron job
3. Set the URL to: `https://your-render-app-name.onrender.com/health`
4. Set the schedule to run every 5-10 minutes: `*/5 * * * *`
5. Enable the job

### 3. Environment Variables

Make sure your backend has the following environment variables set:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
# Add other required environment variables
```

### 4. Render Deployment

1. Connect your GitHub repository to Render
2. Set the build command: `npm install`
3. Set the start command: `npm start`
4. Set the environment to Node.js
5. Add your environment variables in the Render dashboard

### 5. Testing the Health Endpoint

You can test the health endpoint locally:

```bash
# Start the backend server
cd backend
npm start

# In another terminal, test the endpoint
curl http://localhost:5001/health

# Or use the provided test script
node test-health.js
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 6. Frontend Deployment

Deploy the frontend to Vercel:

1. Connect your GitHub repository to Vercel
2. Set the framework preset to Next.js
3. Add environment variables for API endpoints
4. Deploy

The frontend will automatically use the new Life OS branding and logo.