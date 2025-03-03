import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MessageCircle, Lock, User, Eye, EyeOff, ExternalLink, Mail, UserPlus } from 'lucide-react';
import { useStore } from '../store';
import { Permission } from '../types';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, if any
  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect to intended destination or home
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate form
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter uzunluğunda olmalıdır');
      setIsLoading(false);
      return;
    }

    try {
      // For demo purposes, we'll use a simplified signup approach
      // In a real app, you would use Supabase auth.signUp
      
      // Define permissions for admin role
      const adminPermissions: Permission[] = [
        'dashboard:view',
        'analytics:view',
        'api:manage',
        'webhooks:manage',
        'users:manage',
        'security:manage',
        'notifications:manage',
        'logs:view'
      ];

      // Create a user object
      const user = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'admin' as 'admin' | 'agent',
        permissions: adminPermissions,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`,
      };
      
      // Login the user
      login(user);
      
      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Hesabınızı oluşturun
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Birleşik mesajlaşma platformunuza erişmek için kaydolun
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
              {success}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Adınızı ve soyadınızı girin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta adresi
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="E-posta adresinizi girin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Bir şifre oluşturun"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Şifreyi Onayla
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Şifrenizi onaylayın"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Hesap oluşturuluyor...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Kaydol
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <Link to="/landing" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
              <ExternalLink className="h-4 w-4 mr-1" />
              Ana Sayfayı Ziyaret Et
            </Link>
            <div className="flex space-x-4">
              <Link to="/landing/privacy-policy.html" className="font-medium text-gray-600 hover:text-gray-900">
                Gizlilik Politikası
              </Link>
              <Link to="/landing/terms.html" className="font-medium text-gray-600 hover:text-gray-900">
                Kullanım Şartları
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten bir hesabınız var mı?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}