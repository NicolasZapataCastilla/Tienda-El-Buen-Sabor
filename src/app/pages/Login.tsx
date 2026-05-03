import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Store } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#121212] text-white font-sans">
      {/* Left side: Branding */}
      <div 
        className="hidden lg:flex w-1/2 flex-col justify-center items-center p-12 border-r border-slate-700/50 relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        
        <div className="z-10 flex flex-col items-center max-w-md text-center">
          <div className="bg-blue-600 p-4 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
            <Store size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-100">
            Tienda El Buen Sabor
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Sistema de gestión integral para tu tienda de abarrotes. 
            Controla tu inventario, ventas y proveedores con facilidad.
          </p>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 sm:px-16 md:px-24 bg-[#0a0a0a]">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Store size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Tienda El Buen Sabor</h1>
          </div>
          
          <h2 className="text-3xl font-semibold text-slate-100 mb-2">Bienvenido de nuevo</h2>
          <p className="text-slate-400 mb-8">Ingresa tus credenciales para acceder al sistema.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-100"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 block" htmlFor="password">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-100 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Quick Login removed as per request */}
        </div>
      </div>
    </div>
  );
};
