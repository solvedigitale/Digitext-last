import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Get Instagram accounts connected to a Facebook page
router.get('/instagram-accounts', async (req, res) => {
  try {
    const { accessToken, pageId } = req.query;
    
    if (!accessToken || !pageId) {
      return res.status(400).json({ error: 'Access token and page ID are required' });
    }
    
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}/instagram_accounts`,
      { params: { access_token: accessToken } }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Instagram accounts:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Instagram accounts' });
  }
});

// Get Facebook pages for a user
router.get('/pages', async (req, res) => {
  try {
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      { params: { access_token: accessToken } }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Facebook pages:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Facebook pages' });
  }
});

// Send message via Instagram
router.post('/send-instagram-message', async (req, res) => {
  try {
    const { accessToken, igUserId, recipientId, message } = req.body;
    
    if (!accessToken || !igUserId || !recipientId || !message) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${igUserId}/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message }
      },
      { params: { access_token: accessToken } }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error sending Instagram message:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send Instagram message' });
  }
});

// Send message via Messenger
router.post('/send-messenger-message', async (req, res) => {
  try {
    const { accessToken, pageId, recipientId, message } = req.body;
    
    if (!accessToken || !pageId || !recipientId || !message) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message }
      },
      { params: { access_token: accessToken } }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error sending Messenger message:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send Messenger message' });
  }
});

export default router;