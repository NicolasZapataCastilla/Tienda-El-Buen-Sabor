import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../api.config';
import { Search, Filter, Plus, Trash2, MoreVertical, Edit2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export const ModuleList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessibleModules } = useAuth();
  
  const currentPath = location.pathname;
  const moduleConfig = accessibleModules.find(m => m.path === currentPath);
  const isReadOnly = moduleConfig?.readOnly;

  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsData, setDetailsData] = useState<any[]>([]);

  // Update data when path changes
  React.useEffect(() => {
    if (currentPath === '/reports') return;
    
    // Fetch from real SQL backend
    fetch(`${API_URL}/api/lists?path=${currentPath}`)
      .then(res => res.json())
      .then(fetchedData => {
        if(Array.isArray(fetchedData)) setData(fetchedData);
        else {
          console.warn("Data is not an array");
          setData([]);
        }
      })
      .catch(err => {
        console.error("Backend fetch error: ", err);
        setData([]);
      });
      
    setSelectedIds(new Set());
    setSearchTerm('');
    setExpandedId(null);
  }, [currentPath]);

  // Dynamic columns based on first item
  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== 'id');
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const chartData = useMemo(() => {
    if (currentPath !== '/consolidated' || !data.length) return [];
    let ingresos = 0;
    let egresos = 0;
    data.forEach(item => {
      if(item.estado === 'INACTIVO') return;
      const valStr = String(item.monto_total || '0').replace('S/. ', '').replace('$', '').replace(',', '');
      const val = parseFloat(valStr) || 0;
      if (item.tipo === 'VENTA') ingresos += val;
      if (item.tipo === 'COMPRA') egresos += val;
    });
    return [
      { name: 'Ingresos (Ventas)', valor: ingresos, fill: '#34d399' },
      { name: 'Egresos (Compras)', valor: egresos, fill: '#fb7185' }
    ];
  }, [data, currentPath]);

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleRowClick = async (id: string) => {
    if (currentPath !== '/sales' && currentPath !== '/purchases') return;
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setDetailsData([]);
    try {
      const res = await fetch(`${API_URL}/api/details?path=${currentPath}&id=${id}`);
      const data = await res.json();
      setDetailsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(item => item.id)));
    }
  };

  const handleDeactivate = async () => {
    for (const id of Array.from(selectedIds)) {
      try {
        const res = await fetch(`${API_URL}/api/deactivate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentPath, id })
        });
        if (!res.ok) {
          const errData = await res.json();
          alert(`Error: ${errData.error}`);
        }
      } catch (err) {
        alert("Error de conexión al desactivar");
      }
    }
    
    // Refresh list
    fetch(`${API_URL}/api/lists?path=${currentPath}`)
      .then(res => res.json())
      .then(fetchedData => {
        if(Array.isArray(fetchedData)) setData(fetchedData);
      })
      .catch(err => {
        console.error("Backend fetch error after deactivate: ", err);
        setData([]);
      });
      
    setShowDeleteConfirm(false);
    setSelectedIds(new Set());
  };

  const title = moduleConfig?.name || currentPath.replace('/', '').toUpperCase();

  if (currentPath === '/reports') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Integración con Power BI</h1>
          <p className="text-slate-400 text-sm mt-1">Configura y visualiza tus reportes de Power BI.</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
          <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mb-4 border border-yellow-500/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Conectar a Power BI</h2>
          <p className="text-slate-400 max-w-lg mb-6">
            Los datos de este sistema están expuestos mediante una API REST para ser consumidos por Power BI. 
            Con esta URL puedes crear reportes avanzados de Ventas, Compras e Inventario.
          </p>
          <div className="bg-[#0a0a0a] border border-slate-800 p-4 rounded-lg w-full max-w-md text-left">
            <p className="text-xs text-slate-500 font-mono mb-1">API Endpoints (JSON)</p>
            <code className="text-blue-400 text-sm block mb-2">{API_URL}/api/lists?path=/sales</code>
            <code className="text-blue-400 text-sm block mb-2">{API_URL}/api/lists?path=/purchases</code>
            <code className="text-blue-400 text-sm block">{API_URL}/api/lists?path=/inventory</code>
          </div>
          <button className="mt-6 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl transition-colors shadow-lg shadow-yellow-600/20 font-medium">
            Generar Token de Acceso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona y visualiza tus registros de {title.toLowerCase()}.</p>
        </div>
        
        {!isReadOnly && (
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors text-sm font-medium"
              >
                <Trash2 size={16} />
                Desactivar ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => navigate(`${currentPath}/new`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20 text-sm font-medium"
            >
              <Plus size={16} />
              Nuevo Registro
            </button>
          </div>
        )}
      </div>

      {/* Consolidated Chart */}
      {currentPath === '/consolidated' && chartData.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-xl" style={{ height: '300px' }}>
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Balance General</h2>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" tickFormatter={(v) => `S/. ${v}`} stroke="#cbd5e1" />
              <YAxis dataKey="name" type="category" stroke="#cbd5e1" width={120} />
              <RechartsTooltip formatter={(value) => [`S/. ${Number(value).toFixed(2)}`, 'Monto']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} itemStyle={{ color: '#38bdf8' }} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters and Table hidden for Consolidated */}
      {currentPath !== '/consolidated' && (
        <>
          {/* Filters and Search */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Buscar en todas las columnas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 placeholder-slate-500 transition-shadow"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                  <tr>
                    {!isReadOnly && (
                      <th scope="col" className="p-4 w-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                            onChange={toggleAll}
                            className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </div>
                      </th>
                    )}
                    <th className="px-6 py-4 font-semibold">ID</th>
                    {columns.map(col => (
                      <th key={col} className="px-6 py-4 font-semibold">
                        {col.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 3} className="px-6 py-8 text-center text-slate-500">
                        No se encontraron registros que coincidan con su búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr 
                          onClick={() => handleRowClick(item.id)}
                          className={`border-b border-slate-800/50 transition-colors group ${currentPath === '/sales' || currentPath === '/purchases' ? 'cursor-pointer hover:bg-slate-800/50' : 'hover:bg-slate-800/30'} ${item.estado === 'INACTIVO' || item.estado === 'inactivo' ? 'bg-red-500/10' : ''}`}
                        >
                          {!isReadOnly && (
                            <td className="p-4" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(item.id)}
                                  onChange={(e) => toggleSelection(e as any, item.id)}
                                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 focus:ring-2"
                                />
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 font-mono text-slate-400">
                            {item.id}
                          </td>
                          {columns.map(col => (
                            <td key={col} className="px-6 py-4">
                              {col === 'estado' ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                  ${item[col] === 'ACTIVO' || item[col] === 'activo'
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }
                                `}>
                                  {item[col]}
                                </span>
                              ) : (
                                <span className={col === 'total' || col === 'price' ? 'font-mono' : ''}>
                                  {item[col]}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                        {expandedId === item.id && (
                          <tr className="bg-[#0f172a]">
                            <td colSpan={columns.length + 2} className="px-6 py-4 border-b border-slate-800/50">
                              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 shadow-inner">
                                <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                                  Detalle de la Transacción <span className="text-xs font-mono text-slate-500">{item.id}</span>
                                </h4>
                                {detailsData.length === 0 ? <p className="text-xs text-slate-500 animate-pulse">Cargando detalles...</p> : (
                                  <table className="w-full text-sm text-left text-slate-300">
                                    <thead className="text-xs uppercase bg-slate-800 text-slate-400 rounded-t-lg">
                                      <tr>
                                        {Object.keys(detailsData[0]).map(k => <th key={k} className="px-4 py-2">{k.replace('_', ' ')}</th>)}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-slate-800/30">
                                      {detailsData.map((d, i) => (
                                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                          {Object.values(d).map((v: any, j) => <td key={j} className="px-4 py-2 font-mono">{v}</td>)}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/30 flex items-center justify-between text-sm text-slate-400">
              <span>Mostrando {filteredData.length} registros</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-50">Ant</button>
                <button className="px-3 py-1 border border-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-50">Sig</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 text-red-400 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">Confirmar Desactivación</h3>
            </div>
            <p className="text-slate-400 mb-6">
              ¿Estás seguro de que deseas desactivar {selectedIds.size} registro(s) seleccionado(s)? Esta acción cambiará su estado a INACTIVO. Puedes reactivarlos después.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors shadow-lg shadow-red-600/20 font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
