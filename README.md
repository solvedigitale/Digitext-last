# Digitext - Unified Messaging Platform

A platform that unifies messaging across Instagram, WhatsApp, and Facebook Messenger.

## Project Structure

- `/src` - Frontend React application
- `/server` - Backend Express server

## Backend Deployment

### Prerequisites

- Node.js 18 or higher
- A Render.com account (or similar hosting service)

### Deployment Steps for Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: digitext-backend
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**: Add all variables from `.env.example`

### Environment Variables

Make sure to set these environment variables in your deployment platform:

```
PORT=3002
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_VERIFY_TOKEN=your_meta_webhook_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_whatsapp_business_account_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
FRONTEND_URL=https://your-frontend-url.netlify.app
```

## Frontend Deployment

The frontend is deployed to Netlify. After deploying the backend, update the API URL in the frontend to point to your deployed backend URL.

## Local Development

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```