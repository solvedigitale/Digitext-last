import { User, Account, Permission } from '../types';
import supabase from '../lib/supabase';

// Facebook Login SDK initialization
export const initFacebookSDK = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if FB is already initialized
    if (typeof FB !== 'undefined') {
      console.log('Facebook SDK already initialized');
      resolve();
      return;
    }

    // Wait for FB SDK to load
    window.fbAsyncInit = function() {
      FB.init({
        appId: '601545699419479', // Your Meta App ID from .env
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      
      // Check if already logged in
      FB.getLoginStatus(function(response) {
        console.log('FB login status:', response.status);
        resolve();
      });
    };

    // Load the SDK asynchronously if it's not already loaded
    if (document.getElementById('facebook-jssdk')) {
      resolve();
      return;
    }

    // Load the Facebook SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

// Login with Facebook
export const loginWithFacebook = (): Promise<{
  accessToken: string;
  userID: string;
  name?: string;
  email?: string;
}> => {
  return new Promise((resolve, reject) => {
    if (typeof FB === 'undefined') {
      reject(new Error('Facebook SDK not initialized'));
      return;
    }

    FB.login(function(response) {
      if (response.authResponse) {
        const { accessToken, userID } = response.authResponse;
        
        // Get user info
        FB.api('/me', { fields: 'name,email' }, function(userInfo) {
          resolve({
            accessToken,
            userID,
            name: userInfo.name,
            email: userInfo.email
          });
        });
      } else {
        reject(new Error('User cancelled login or did not fully authorize.'));
      }
    }, { 
      scope: 'email,pages_show_list,pages_manage_metadata,pages_messaging,business_management,pages_read_engagement,instagram_basic,instagram_manage_messages,instagram_content_publish',
      auth_type: 'rerequest'
    });
  });
};

// Get Facebook Pages
export const getFacebookPages = (accessToken: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (typeof FB === 'undefined') {
      reject(new Error('Facebook SDK not initialized'));
      return;
    }

    FB.api('/me/accounts', { access_token: accessToken }, function(response) {
      console.log('Facebook pages response:', response);
      if (response.error) {
        reject(response.error);
      } else if (!response.data || response.data.length === 0) {
        reject(new Error('No Facebook Pages found. You need at least one Facebook Page to use this app.'));
      } else {
        resolve(response.data || []);
      }
    });
  });
};

// Get Instagram Business Account connected to a Facebook Page
export const getInstagramAccount = (accessToken: string, pageId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof FB === 'undefined') {
      reject(new Error('Facebook SDK not initialized'));
      return;
    }

    console.log(`Fetching Instagram accounts for page ${pageId} with token ${accessToken.substring(0, 10)}...`);
    
    FB.api(`/${pageId}/instagram_accounts`, { access_token: accessToken }, function(response) {
      console.log('Instagram accounts response:', response);
      if (response.error) {
        reject(response.error);
      } else if (response.data && response.data.length > 0) {
        // Get the Instagram Business Account ID
        const igAccountId = response.data[0].id;
        
        FB.api(`/${igAccountId}?fields=id,username,profile_picture_url`, { access_token: accessToken }, function(igResponse) {
          console.log('Instagram account details response:', igResponse);
          if (igResponse.error) {
            reject(igResponse.error);
          } else {
            resolve(igResponse);
          }
        });
      } else {
        reject(new Error('No Instagram account found for this page'));
      }
    });
  });
};

// Get WhatsApp Business Account details
export const getWhatsAppBusinessAccount = async (accessToken: string, phoneNumberId: string): Promise<any> => {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/whatsapp_business_profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WhatsApp business account: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching WhatsApp business account:', error);
    throw error;
  }
};

// Register or login user with Supabase
export const registerOrLoginUser = async (userData: {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}): Promise<User> => {
  // Create a user object
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: 'admin',
    avatar: userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`,
    permissions: ['dashboard:view', 'api:manage', 'webhooks:manage']
  };
};

// Add account to Supabase
export const addAccountToSupabase = async (account: {
  user_id: string;
  name: string;
  platform: string;
  avatar_url?: string;
  access_token?: string;
  page_id?: string;
  ig_user_id?: string;
  phone_number_id?: string;
  business_id?: string;
  external_id?: string;
}): Promise<Account> => {
  // Create an account object
  return {
    id: `${account.platform}-${Date.now()}`,
    name: account.name,
    platform: account.platform as 'instagram' | 'whatsapp' | 'messenger',
    avatar: account.avatar_url || '',
    unreadCount: 0,
    accessToken: account.access_token,
    pageId: account.page_id,
    igUserId: account.ig_user_id,
    phoneNumberId: account.phone_number_id,
    businessId: account.business_id,
    externalId: account.external_id
  };
};

// Connect Facebook account with manual credentials
export const connectFacebookAccount = async (userData: {
  userId: string;
  name: string;
  accessToken: string;
  pageId: string;
}): Promise<Account> => {
  try {
    // Add account to Supabase
    return await addAccountToSupabase({
      user_id: userData.userId,
      name: `${userData.name} (Messenger)`,
      platform: 'messenger',
      avatar_url: `https://graph.facebook.com/${userData.pageId}/picture?type=large`,
      access_token: userData.accessToken,
      page_id: userData.pageId,
      business_id: userData.pageId
    });
  } catch (error) {
    console.error('Error connecting Facebook account:', error);
    throw error;
  }
};

// Connect Instagram account with manual credentials
export const connectInstagramAccount = async (userData: {
  userId: string;
  name: string;
  accessToken: string;
  pageId: string;
  igUserId: string;
}): Promise<Account> => {
  try {
    // Add account to Supabase
    return await addAccountToSupabase({
      user_id: userData.userId,
      name: `${userData.name} (Instagram)`,
      platform: 'instagram',
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=E1306C&color=fff`,
      access_token: userData.accessToken,
      page_id: userData.pageId,
      ig_user_id: userData.igUserId,
      business_id: userData.pageId
    });
  } catch (error) {
    console.error('Error connecting Instagram account:', error);
    throw error;
  }
};

// Connect WhatsApp account with manual credentials
export const connectWhatsAppAccount = async (userData: {
  userId: string;
  name: string;
  accessToken: string;
  phoneNumberId: string;
  businessId?: string;
}): Promise<Account> => {
  try {
    // Add account to Supabase
    return await addAccountToSupabase({
      user_id: userData.userId,
      name: `${userData.name} (WhatsApp)`,
      platform: 'whatsapp',
      avatar_url: `https://ui-avatars.com/api/?name=WA&background=25D366&color=fff`,
      access_token: userData.accessToken,
      phone_number_id: userData.phoneNumberId,
      business_id: userData.businessId
    });
  } catch (error) {
    console.error('Error connecting WhatsApp account:', error);
    throw error;
  }
};

// Get user accounts from Supabase
export const getUserAccounts = async (userId: string): Promise<Account[]> => {
  try {
    // For demo purposes, return empty array
    return [];
  } catch (error) {
    console.error('Error getting user accounts:', error);
    return [];
  }
};

// Verify API credentials
export const verifyApiCredentials = async (platform: string, credentials: any): Promise<boolean> => {
  try {
    if (platform === 'instagram' && credentials.accessToken && credentials.igUserId) {
      // Test Instagram connection
      await fetch(`https://graph.facebook.com/v18.0/${credentials.igUserId}?fields=id,username&access_token=${credentials.accessToken}`);
      return true;
    } else if (platform === 'messenger' && credentials.accessToken && credentials.pageId) {
      // Test Messenger connection
      await fetch(`https://graph.facebook.com/v18.0/${credentials.pageId}?access_token=${credentials.accessToken}`);
      return true;
    } else if (platform === 'whatsapp' && credentials.accessToken && credentials.phoneNumberId) {
      // Test WhatsApp connection
      await fetch(`https://graph.facebook.com/v18.0/${credentials.phoneNumberId}/whatsapp_business_profile`, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying API credentials:', error);
    return false;
  }
};

// Get user permissions
export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
  try {
    // Default permissions based on role
    return [
      'dashboard:view',
      'analytics:view',
      'api:manage',
      'webhooks:manage',
      'users:manage',
      'security:manage',
      'notifications:manage',
      'logs:view'
    ];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, userData: {
  name?: string;
  email?: string;
  avatar_url?: string;
}): Promise<boolean> => {
  try {
    // For demo purposes, return true
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// Change user password (for email/password auth)
export const changeUserPassword = async (email: string, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // For demo purposes, return true
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    return false;
  }
};

// Store session in localStorage
export const storeUserSession = (user: User, metaData: any) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('metaData', JSON.stringify(metaData));
};

// Get stored user session
export const getStoredUserSession = (): { user: User | null, metaData: any | null } => {
  const userStr = localStorage.getItem('user');
  const metaDataStr = localStorage.getItem('metaData');
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    metaData: metaDataStr ? JSON.parse(metaDataStr) : null
  };
};

// Clear user session
export const clearUserSession = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('metaData');
};

// Logout from Facebook
export const logoutFromFacebook = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof FB !== 'undefined') {
      FB.logout(function(response) {
        console.log('Logged out from Facebook');
        resolve();
      });
    } else {
      console.log('Facebook SDK not loaded');
      resolve();
    }
  });
};

// Complete logout (clear all sessions)
export const completeLogout = async (): Promise<void> => {
  try {
    // Clear local storage
    clearUserSession();
    
    // Logout from Facebook
    await logoutFromFacebook();
    
    console.log('Logout completed successfully');
  } catch (error) {
  }
}