import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import metaRoutes from './routes/meta.js';
import whatsappRoutes from './routes/whatsapp.js';
import webhookRoutes from './routes/webhooks.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://digitext.io']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/meta', metaRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/webhooks', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send('Digitext API Server is running');
});

// Start server
const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;