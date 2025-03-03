import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Send message via WhatsApp
router.post('/send-message', async (req, res) => {
  try {
    const { phoneNumber, message, accessToken, phoneNumberId } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }
    
    // Use provided token or fallback to env
    const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    const numberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!token || !numberId) {
      return res.status(400).json({ error: 'WhatsApp credentials not configured' });
    }
    
    // Format phone number (remove any non-digit characters)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${numberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

// Get WhatsApp business profile
router.get('/business-profile', async (req, res) => {
  try {
    const { accessToken, phoneNumberId } = req.query;
    
    // Use provided token or fallback to env
    const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    const numberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!token || !numberId) {
      return res.status(400).json({ error: 'WhatsApp credentials not configured' });
    }
    
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${numberId}/whatsapp_business_profile`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching WhatsApp business profile:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch WhatsApp business profile' });
  }
});

export default router;