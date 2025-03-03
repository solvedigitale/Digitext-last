import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AccountSelector } from './components/AccountSelector';
import { ContactList } from './components/ContactList';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { Sidebar } from './components/Sidebar';
import { Settings } from './components/Settings';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { useStore } from './store';
import { Settings as SettingsIcon, Filter } from 'lucide-react';
import { initFacebookSDK } from './services/auth';

function App() {
  const { currentView, setCurrentView, isAuthenticated, currentUser } = useStore();
  const [showFilters, setShowFilters] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize Facebook SDK
  useEffect(() => {
    initFacebookSDK().catch(error => {
      console.error('Facebook SDK başlatılamadı:', error);
    });
  }, []);

  // Handle landing page routes
  useEffect(() => {
    if (location.pathname === '/landing' || location.pathname === '/landing/') {
      window.location.href = 'https://digitext.io';
    }
  }, [location.pathname]);

  // If on landing page route, don't render React app
  if (location.pathname.startsWith('/landing/')) {
    return null;
  }

  // If not authenticated and not on login or signup page, redirect to login
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup') {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // If authenticated and on login or signup page, redirect to home
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/" />;
  }

  // If on settings route, render Settings
  if (location.pathname === '/settings') {
    return isAuthenticated ? <Settings /> : <Navigate to="/login" />;
  }

  // If on chat route, render chat interface
  if (location.pathname === '/' && isAuthenticated) {
    return (
      <div className="flex h-screen bg-white">
        {/* Left sidebar - Contacts */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Mesajlar</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Filtrele"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Ayarlar"
              >
                <SettingsIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          <AccountSelector />
          
          <ContactList showFilters={showFilters} />
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          <ChatHeader />
          <MessageList />
          <MessageInput />
        </div>
        
        {/* Right sidebar - Customer info */}
        <Sidebar />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;