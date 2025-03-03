import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Mail, Lock, Eye, EyeOff, Bell, Shield, 
  MessageCircle, Facebook, Instagram, LogOut, Plus, BarChart2, Database,
  Server, Users, Settings as SettingsIcon, BarChart
} from 'lucide-react';
import { useStore } from '../store';
import { metaApi, whatsappApi } from '../services/api';
import { Dashboard } from '../admin/Dashboard';
import { ApiConnections } from '../admin/ApiConnections';
import { WebhookSettings } from '../admin/WebhookSettings';
import { UserManagement } from '../admin/UserManagement';
import { SystemLogs } from '../admin/SystemLogs';
import { SecuritySettings } from '../admin/SecuritySettings';
import { NotificationSettings } from '../admin/NotificationSettings';
import { AgentAnalytics } from '../admin/AgentAnalytics';
import { Permission } from '../types';
import { ApiConnectionWizard } from './ApiConnectionWizard';

export function Settings() {
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission } = useStore();
  const [activeTab, setActiveTab] = useState('connections');
  const [showPassword, setShowPassword] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showConnectionWizard, setShowConnectionWizard] = useState(false);
  
  // Form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [connectionForm, setConnectionForm] = useState({
    name: '',
    platform: 'instagram' as 'instagram' | 'whatsapp' | 'messenger',
    accessToken: '',
    pageId: '',
    igUserId: '',
    phoneNumberId: '',
    businessId: '',
  });
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic
    alert('Profile updated successfully!');
  };
  
  const handleConnectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add connection logic
    const { name, platform, accessToken, pageId, igUserId, phoneNumberId, businessId } = connectionForm;
    
    const newAccount = {
      id: `${platform}-${Date.now()}`,
      name,
      platform,
      avatar: 'https://unsplash.com/photos/a-person-holding-a-cell-phone-in-their-hand-QEgHL8NN7nw/download?force=true&w=64&h=64',
      unreadCount: 0,
      accessToken,
      pageId: platform === 'messenger' || platform === 'instagram' ? pageId : undefined,
      igUserId: platform === 'instagram' ? igUserId : undefined,
      phoneNumberId: platform === 'whatsapp' ? phoneNumberId : undefined,
      businessId,
    };
    
    // Add to store
    useStore.getState().addAccount(newAccount);
    
    // Reset form and close modal
    setConnectionForm({
      name: '',
      platform: 'instagram',
      accessToken: '',
      pageId: '',
      igUserId: '',
      phoneNumberId: '',
      businessId: '',
    });
    setShowConnectionForm(false);
    setTestResult(null);
    
    alert('Connection added successfully!');
  };
  
  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const { platform, accessToken, pageId, igUserId, phoneNumberId } = connectionForm;
      
      if (platform === 'instagram' && accessToken && igUserId) {
        // Test Instagram connection
        await metaApi.getInstagramAccounts(accessToken, pageId || '');
        setTestResult({ success: true, message: 'Instagram connection successful!' });
      } else if (platform === 'messenger' && accessToken && pageId) {
        // Test Messenger connection
        await metaApi.getPages(accessToken);
        setTestResult({ success: true, message: 'Messenger connection successful!' });
      } else if (platform === 'whatsapp' && accessToken && phoneNumberId) {
        // Test WhatsApp connection
        await whatsappApi.getBusinessProfile(accessToken, phoneNumberId);
        setTestResult({ success: true, message: 'WhatsApp connection successful!' });
      } else {
        setTestResult({ success: false, message: 'Please fill in all required fields for the selected platform.' });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult({ success: false, message: 'Connection test failed. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin panel tabs with permission requirements
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 className="mr-3 h-5 w-5 text-gray-500" />, permission: 'dashboard:view' as Permission },
    { id: 'analytics', label: 'Temsilci Analitiği', icon: <BarChart className="mr-3 h-5 w-5 text-gray-500" />, permission: 'analytics:view' as Permission },
    { id: 'api-connections', label: 'API Connections', icon: <Database className="mr-3 h-5 w-5 text-gray-500" />, permission: 'api:manage' as Permission },
    { id: 'webhooks', label: 'Webhook Settings', icon: <Server className="mr-3 h-5 w-5 text-gray-500" />, permission: 'webhooks:manage' as Permission },
    { id: 'users', label: 'User Management', icon: <Users className="mr-3 h-5 w-5 text-gray-500" />, permission: 'users:manage' as Permission },
    { id: 'security', label: 'Security', icon: <Shield className="mr-3 h-5 w-5 text-gray-500" />, permission: 'security:manage' as Permission },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="mr-3 h-5 w-5 text-gray-500" />, permission: 'notifications:manage' as Permission },
    { id: 'logs', label: 'System Logs', icon: <Server className="mr-3 h-5 w-5 text-gray-500" />, permission: 'logs:view' as Permission },
  ];
  
  // Filter admin tabs based on user permissions
  const availableAdminTabs = adminTabs.filter(tab => hasPermission(tab.permission));
  
  // Render admin content based on active tab
  const renderAdminContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <AgentAnalytics />;
      case 'api-connections':
        return <ApiConnections />;
      case 'webhooks':
        return <WebhookSettings />;
      case 'users':
        return <UserManagement />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'logs':
        return <SystemLogs />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to App
              </button>
            </div>
            <div className="flex items-center">
              {currentUser && (
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={currentUser.avatar}
                    alt={currentUser.name}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{currentUser.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Settings</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your account settings and preferences.
                </p>
                
                <nav className="mt-5 space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                      activeTab === 'profile'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <User className="mr-3 h-5 w-5 text-gray-500" />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('connections')}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                      activeTab === 'connections'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <MessageCircle className="mr-3 h-5 w-5 text-gray-500" />
                    API Connections
                  </button>
                  
                  {/* Admin section - only visible to users with admin permissions */}
                  {availableAdminTabs.length > 0 && (
                    <>
                      <div className="pt-2 pb-1">
                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Admin Panel
                        </p>
                      </div>
                      
                      {availableAdminTabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                            activeTab === tab.id
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                    </>
                  )}
                  
                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-5 w-5 text-red-500" />
                      Logout
                    </button>
                  </div>
                </nav>
              </div>
            </div>
            
            <div className="mt-5 md:mt-0 md:col-span-2">
              {/* Profile settings */}
              {activeTab === 'profile' && (
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Update your account profile information and email.
                      </p>
                    </div>
                    
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Your name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Update your password to a new secure one.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="current-password"
                            id="current-password"
                            value={profileForm.currentPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Current password"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="new-password"
                            id="new-password"
                            value={profileForm.newPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="New password"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="confirm-password"
                            id="confirm-password"
                            value={profileForm.confirmPassword}
                            onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {/* API Connections */}
              {activeTab === 'connections' && (
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">API Connections</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Connect your messaging platforms to the app.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowConnectionWizard(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Connection
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              <Instagram className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">Instagram Business</h4>
                              <p className="text-xs text-gray-500">Connect your Instagram Business account</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowConnectionWizard(true)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Connect
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 rounded-full bg-green-500 text-white">
                              <MessageCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">WhatsApp Business</h4>
                              <p className="text-xs text-gray-500">Connect your WhatsApp Business account</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setConnectionForm({
                                ...connectionForm,
                                platform: 'whatsapp'
                              });
                              setShowConnectionWizard(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Connect
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="p-2 rounded-full bg-blue-500 text-white">
                              <Facebook className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">Facebook Messenger</h4>
                              <p className="text-xs text-gray-500">Connect your Facebook Page</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setConnectionForm({
                                ...connectionForm,
                                platform: 'messenger'
                              });
                              setShowConnectionWizard(true);
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Admin panel content */}
              {availableAdminTabs.some(tab => tab.id === activeTab) && renderAdminContent()}
              
              {/* Connection Wizard Modal */}
              {showConnectionWizard && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                  <ApiConnectionWizard 
                    onComplete={() => setShowConnectionWizard(false)} 
                    onCancel={() => setShowConnectionWizard(false)} 
                  />
                </div>
              )}
              
              {/* Connection Form Modal */}
              {showConnectionForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Add New Connection
                    </h3>
                    
                    <form onSubmit={handleConnectionSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Connection Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={connectionForm.name}
                          onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                          Platform
                        </label>
                        <select
                          id="platform"
                          value={connectionForm.platform}
                          onChange={(e) => setConnectionForm({ ...connectionForm, platform: e.target.value as any })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="instagram">Instagram Business</option>
                          <option value="whatsapp">WhatsApp Business</option>
                          <option value="messenger">Facebook Messenger</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">
                          Access Token
                        </label>
                        <input
                          type="password"
                          id="accessToken"
                          value={connectionForm.accessToken}
                          onChange={(e) => setConnectionForm({ ...connectionForm, accessToken: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">
                          Business Account ID (Optional)
                        </label>
                        <input
                          type="text"
                          id="businessId"
                          value={connectionForm.businessId}
                          onChange={(e) => setConnectionForm({ ...connectionForm, businessId: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Your Business Account ID"
                        />
                      </div>
                      
                      {connectionForm.platform === 'instagram' && (
                        <>
                          <div>
                            <label htmlFor="pageId" className="block text-sm font-medium text-gray-700">
                              Facebook Page ID
                            </label>
                            <input
                              type="text"
                              id="pageId"
                              value={connectionForm.pageId}
                              onChange={(e) => setConnectionForm({ ...connectionForm, pageId: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="igUserId" className="block text-sm font-medium text-gray-700">
                              Instagram Business Account ID
                            </label>
                            <input
                              type="text"
                              id="igUserId"
                              value={connectionForm.igUserId}
                              onChange={(e) => setConnectionForm({ ...connectionForm, igUserId: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </>
                      )}
                      
                      {connectionForm.platform === 'messenger' && (
                        <div>
                          <label htmlFor="pageId" className="block text-sm font-medium text-gray-700">
                            Facebook Page ID
                          </label>
                          <input
                            type="text"
                            id="pageId"
                            value={connectionForm.pageId}
                            onChange={(e) => setConnectionForm({ ...connectionForm, pageId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      )}
                      
                      {connectionForm.platform === 'whatsapp' && (
                        <div>
                          <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700">
                            WhatsApp Phone Number ID
                          </label>
                          <input
                            type="text"
                            id="phoneNumberId"
                            value={connectionForm.phoneNumberId}
                            onChange={(e) => setConnectionForm({ ...connectionForm, phoneNumberId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      )}
                      
                      {testResult && (
                        <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                          {testResult.message}
                        </div>
                      )}
                      
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={testConnection}
                          disabled={isLoading}
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {isLoading ? 'Testing...' : 'Test Connection'}
                        </button>
                        
                        <button
                          type="submit"
                          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Add Connection
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowConnectionForm(false)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-3"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}