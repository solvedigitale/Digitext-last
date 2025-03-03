import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Meta Platform Webhook Verification (for both Instagram and Messenger)
router.get('/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const verifyToken = process.env.META_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Meta webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('Meta webhook verification failed');
    res.sendStatus(403);
  }
});

// Meta Platform Webhook (for both Instagram and Messenger)
router.post('/meta', (req, res) => {
  const body = req.body;
  
  if (body.object === 'instagram') {
    // Handle Instagram webhook events
    const entries = body.entry || [];
    
    for (const entry of entries) {
      // Process Instagram messages
      const messages = entry.messaging || [];
      
      for (const message of messages) {
        console.log('Instagram message received:', message);
        
        // Emit to connected clients via Socket.io
        req.io.emit('instagram_message', message);
      }
    }
  } else if (body.object === 'page') {
    // Handle Messenger webhook events
    const entries = body.entry || [];
    
    for (const entry of entries) {
      // Process Messenger messages
      const messages = entry.messaging || [];
      
      for (const message of messages) {
        console.log('Messenger message received:', message);
        
        // Emit to connected clients via Socket.io
        req.io.emit('messenger_message', message);
      }
    }
  }
  
  res.status(200).send('EVENT_RECEIVED');
});

// WhatsApp Webhook Verification
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  const verifyToken = process.env.META_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('WhatsApp webhook verification failed');
    res.sendStatus(403);
  }
});

// WhatsApp Webhook
router.post('/whatsapp', (req, res) => {
  const body = req.body;
  
  if (body.object) {
    if (body.entry && body.entry.length > 0) {
      const entry = body.entry[0];
      
      if (entry.changes && entry.changes.length > 0) {
        const change = entry.changes[0];
        
        if (change.value && change.value.messages && change.value.messages.length > 0) {
          const message = change.value.messages[0];
          console.log('WhatsApp message received:', message);
          
          // Emit to connected clients via Socket.io
          req.io.emit('whatsapp_message', message);
        }
      }
    }
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

export default router;