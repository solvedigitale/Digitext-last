import { io } from 'socket.io-client';
import { useStore } from '../store';
import supabase from '../lib/supabase';

// Initialize socket connection to listen for webhook events
export const initializeWebhookListener = () => {
  // Socket URL - update this with your deployed backend URL
  const SOCKET_URL = process.env.NODE_ENV === 'production'
    ? 'https://digitext-backend.onrender.com'
    : 'http://localhost:3002';
  
  const socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'], // Try websocket first, then fallback to polling
    autoConnect: true
  });
  
  socket.on('connect', () => {
    console.log('Bağlantı kuruldu: Webhook sunucusuna bağlandı');
  });
  
  socket.on('disconnect', () => {
    console.log('Bağlantı kesildi: Webhook sunucusundan bağlantı kesildi');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Bağlantı hatası:', error);
    // Try to reconnect after a delay
    setTimeout(() => {
      if (socket) {
        socket.connect();
      }
    }, 5000);
  });
  
  // Listen for Instagram messages
  socket.on('instagram_message', (data) => {
    console.log('Instagram mesajı alındı:', data);
    handleInstagramMessage(data);
  });
  
  // Listen for Messenger messages
  socket.on('messenger_message', (data) => {
    console.log('Messenger mesajı alındı:', data);
    handleMessengerMessage(data);
  });
  
  // Listen for WhatsApp messages
  socket.on('whatsapp_message', (data) => {
    console.log('WhatsApp mesajı alındı:', data);
    handleWhatsAppMessage(data);
  });
  
  return socket;
};

// Handle Instagram message from webhook
const handleInstagramMessage = async (data: any) => {
  const store = useStore.getState();
  
  // Extract message details
  const senderId = data.sender?.id;
  const recipientId = data.recipient?.id;
  const messageText = data.message?.text;
  const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
  
  if (!senderId || !messageText) return;
  
  // Find the corresponding Instagram account
  const account = store.accounts.find(a => 
    a.platform === 'instagram' && a.igUserId === recipientId
  );
  
  if (!account) return;
  
  try {
    // Check if we already have this contact
    let contact = store.contacts.find(c => 
      c.accountId === account.id && 
      c.externalId === senderId
    );
    
    if (contact) {
      // Update existing contact
      store.updateContact(contact.id, {
        lastMessage: messageText,
        lastMessageTime: timestamp,
        unreadCount: contact.unreadCount + 1
      });
    } else {
      // Create new contact
      const newContact = {
        id: `contact-${Date.now()}`,
        name: `Instagram Kullanıcısı ${senderId.substring(0, 6)}`,
        avatar: `https://ui-avatars.com/api/?name=IG&background=E1306C&color=fff`,
        lastMessage: messageText,
        lastMessageTime: timestamp,
        unreadCount: 1,
        platform: 'instagram',
        accountId: account.id,
        labels: [],
        externalId: senderId
      };
      
      store.addContact(newContact);
      contact = newContact;
    }
    
    // Add message
    store.addMessage(contact.id, {
      id: `msg-${Date.now()}`,
      content: messageText,
      timestamp,
      sender: 'contact',
      isRead: false
    });
  } catch (error) {
    console.error('Instagram mesajı işlenirken hata oluştu:', error);
  }
};

// Handle Messenger message from webhook
const handleMessengerMessage = async (data: any) => {
  const store = useStore.getState();
  
  // Extract message details
  const senderId = data.sender?.id;
  const recipientId = data.recipient?.id; // This is the page ID
  const messageText = data.message?.text;
  const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
  
  if (!senderId || !messageText) return;
  
  // Find the corresponding Messenger account
  const account = store.accounts.find(a => 
    a.platform === 'messenger' && a.pageId === recipientId
  );
  
  if (!account) return;
  
  try {
    // Check if we already have this contact
    let contact = store.contacts.find(c => 
      c.accountId === account.id && 
      c.externalId === senderId
    );
    
    if (contact) {
      // Update existing contact
      store.updateContact(contact.id, {
        lastMessage: messageText,
        lastMessageTime: timestamp,
        unreadCount: contact.unreadCount + 1
      });
    } else {
      // Create new contact
      const newContact = {
        id: `contact-${Date.now()}`,
        name: `Messenger Kullanıcısı ${senderId.substring(0, 6)}`,
        avatar: `https://ui-avatars.com/api/?name=FB&background=0084FF&color=fff`,
        lastMessage: messageText,
        lastMessageTime: timestamp,
        unreadCount: 1,
        platform: 'messenger',
        accountId: account.id,
        labels: [],
        externalId: senderId
      };
      
      store.addContact(newContact);
      contact = newContact;
    }
    
    // Add message
    store.addMessage(contact.id, {
      id: `msg-${Date.now()}`,
      content: messageText,
      timestamp,
      sender: 'contact',
      isRead: false
    });
  } catch (error) {
    console.error('Messenger mesajı işlenirken hata oluştu:', error);
  }
};

// Handle WhatsApp message from webhook
const handleWhatsAppMessage = async (data: any) => {
  const store = useStore.getState();
  
  // Extract message details
  const senderId = data.from;
  const phoneNumberId = data.metadata?.phone_number_id;
  const messageText = data.text?.body;
  const timestamp = data.timestamp ? new Date(parseInt(data.timestamp) * 1000) : new Date();
  
  if (!senderId || !messageText || !phoneNumberId) return;
  
  // Find the corresponding WhatsApp account
  const account = store.accounts.find(a => 
    a.platform === 'whatsapp' && a.phoneNumberId === phoneNumberId
  );
  
  if (!account) return;
  
  try {
    // Check if we already have this contact
    let contact = store.contacts.find(c => 
      c.accountId === account.id && 
      c.externalId === senderId
    );
    
    if (contact) {
      // Update existing contact
      store.updateContact(contact.id, {
        lastMessage: messageText,
        lastMessageTime: timestamp,
        unreadCount: contact.unreadCount + 1
      });
    } else {
      // Create new contact
      const newContact = {
        id: `contact-${Date.now()}`,
        name: `WhatsApp ${senderId.substring(senderId.length - 6)}`,
        avatar: `https://ui-avatars.com/api/?name=WA&background=25D366&color=fff`,
        lastMessage: messageText,
        lastMessageTime: timestamp,
        unreadCount: 1,
        platform: 'whatsapp',
        accountId: account.id,
        labels: [],
        externalId: senderId
      };
      
      store.addContact(newContact);
      contact = newContact;
    }
    
    // Add message
    store.addMessage(contact.id, {
      id: `msg-${Date.now()}`,
      content: messageText,
      timestamp,
      sender: 'contact',
      isRead: false
    });
  } catch (error) {
    console.error('WhatsApp mesajı işlenirken hata oluştu:', error);
  }
};

export default initializeWebhookListener;