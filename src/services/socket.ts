import { io, Socket } from 'socket.io-client';
import { useStore } from '../store';

// Socket.io connection
let socket: Socket | null = null;

export const initializeSocket = () => {
  if (socket) return socket;
  
  // Socket URL - update this with your deployed backend URL
  const SOCKET_URL = process.env.NODE_ENV === 'production'
    ? 'https://digitext-backend.onrender.com'  // Your deployed backend URL
    : 'http://localhost:3002';
  
  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'], // Try websocket first, then fallback to polling
    autoConnect: true
  });
  
  socket.on('connect', () => {
    console.log('Sunucuya bağlandı');
  });
  
  socket.on('disconnect', () => {
    console.log('Sunucudan bağlantı kesildi');
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
  
  // Listen for WhatsApp messages
  socket.on('whatsapp_message', (message) => {
    console.log('WhatsApp mesajı alındı:', message);
    handleIncomingMessage('whatsapp', message);
  });
  
  // Listen for Instagram messages
  socket.on('instagram_message', (message) => {
    console.log('Instagram mesajı alındı:', message);
    handleIncomingMessage('instagram', message);
  });
  
  // Listen for Messenger messages
  socket.on('messenger_message', (message) => {
    console.log('Messenger mesajı alındı:', message);
    handleIncomingMessage('messenger', message);
  });
  
  return socket;
};

// Handle incoming messages from any platform
const handleIncomingMessage = (platform: 'whatsapp' | 'instagram' | 'messenger', message: any) => {
  const store = useStore.getState();
  
  // Find the appropriate account
  const account = store.accounts.find(acc => acc.platform === platform);
  
  if (!account) return;
  
  // Extract message details based on platform
  let senderId = '';
  let senderName = '';
  let content = '';
  
  if (platform === 'whatsapp') {
    senderId = message.from;
    content = message.text?.body || '';
    senderName = message.contacts?.[0]?.profile?.name || senderId;
  } else if (platform === 'instagram') {
    senderId = message.sender?.id;
    content = message.message?.text || '';
    senderName = message.sender?.name || senderId;
  } else if (platform === 'messenger') {
    senderId = message.sender?.id;
    content = message.message?.text || '';
    senderName = message.sender?.name || senderId;
  }
  
  // Check if contact exists
  let contact = store.contacts.find(c => 
    c.accountId === account.id && 
    (c.externalId === senderId || c.name.includes(senderId))
  );
  
  // If contact doesn't exist, create a new one
  if (!contact) {
    const newContact = {
      id: `contact-${Date.now()}`,
      name: senderName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`,
      lastMessage: content,
      lastMessageTime: new Date(),
      unreadCount: 1,
      platform: platform,
      accountId: account.id,
      labels: [],
      externalId: senderId
    };
    
    // Add the new contact
    store.addContact(newContact);
    
    // Create a new message entry
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: content,
      timestamp: new Date(),
      sender: 'contact',
      isRead: false,
    };
    
    // Add the message
    store.addMessage(newContact.id, newMessage);
  } else {
    // Update existing contact
    store.updateContact(contact.id, {
      lastMessage: content,
      lastMessageTime: new Date(),
      unreadCount: contact.unreadCount + 1
    });
    
    // Add new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: content,
      timestamp: new Date(),
      sender: 'contact',
      isRead: false,
    };
    
    store.addMessage(contact.id, newMessage);
  }
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};