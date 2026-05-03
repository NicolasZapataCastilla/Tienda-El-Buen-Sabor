import React from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../../api.config';
import { BarChart3, TrendingUp, Users, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';
import * as LucideIcons from 'lucide-react';

const getIcon = (iconName: string) => {
  const componentName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const Icon = (LucideIcons as any)[componentName] || LucideIcons.HelpCircle;
  return Icon;
};

export const Dashboard = () => {
  const { user, accessibleModules } = useAuth();

  const [metrics, setMetrics] = React.useState<any[]>([]);

  const fetchMetrics = React.useCallback(() => {
    if (user?.role) {
      fetch(`${API_URL}/api/dashboard?role=${user.role}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const parsedData = data.map(item => ({
              ...item,
              icon: (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle
            }));
            setMetrics(parsedData);
          }
        })
        .catch(err => console.error("Error fetching dashboard metrics:", err));
    }
  }, [user]);

  React.useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Bienvenido de nuevo, {user?.name}</h1>
        <p className="text-slate-400 mt-1">Esto es lo que ocurre en tu espacio de trabajo hoy.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl hover:bg-slate-900/60 transition-colors group relative overflow-hidden">
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${metric.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                  <h3 className="text-2xl font-bold text-slate-100 mt-1">{metric.value}</h3>
                </div>
                <div className={`p-3 ${metric.bg} rounded-xl`}>
                  <Icon size={20} className={metric.color} />
                </div>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1 relative z-10">
                <TrendingUp size={14} className={metric.color} />
                {metric.trend}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Módulos de Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accessibleModules.map(module => {
            const Icon = getIcon(module.icon);
            return (
              <Link
                key={module.path}
                to={module.path}
                className="flex items-center gap-4 p-4 bg-[#0a0a0a]/50 border border-slate-800 rounded-xl hover:bg-slate-900/80 hover:border-slate-700 transition-all group"
              >
                <div className="p-3 bg-slate-800/50 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                  <Icon size={20} className="text-slate-400 group-hover:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{module.name}</h3>
                  <p className="text-xs text-slate-500">Gestionar registros</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
