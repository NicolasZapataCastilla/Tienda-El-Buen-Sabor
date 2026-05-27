import React from 'react';
import { Database, Layout, ExternalLink, RefreshCw, Info, CheckCircle2 } from 'lucide-react';

export const PowerBI = () => {
  const handleSync = () => {
    alert("Sincronización Iniciada:\n1. Asegúrate de estar usando DirectQuery en Power BI.\n2. Si usas 'Import', haz clic en el botón 'Actualizar' en Power BI Desktop.\n\nLos datos en SQL Server ya están actualizados.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layout className="text-yellow-400" /> Integración con Power BI
          </h1>
          <p className="text-slate-400 text-sm mt-1">Conecta tu base de datos SQL para análisis avanzado.</p>
        </div>
        <button 
          onClick={handleSync}
          className="flex items-center gap-2 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-yellow-600/20"
        >
          <RefreshCw size={18} /> SINCRONIZAR DATOS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Guide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Database size={20} className="text-blue-400" /> Configuración de Conexión
            </h2>
            
            <div className="space-y-4 text-slate-300 text-sm">
              <div className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <Info className="text-blue-400 shrink-0" size={20} />
                <p>Usa los siguientes parámetros en <b>Power BI Desktop (Obtener Datos - SQL Server)</b> para conectar directamente con este sistema.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase font-bold">Servidor</span>
                  <p className="text-blue-400 font-mono mt-1">localhost</p>
                </div>
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 uppercase font-bold">Base de Datos</span>
                  <p className="text-blue-400 font-mono mt-1">empresa</p>
                </div>
              </div>

              <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700">
                <h3 className="font-bold text-slate-200 mb-3">Recomendación: Modo de Conectividad</h3>
                <div className="flex gap-4">
                  <div className="flex-1 p-3 bg-slate-900/80 rounded-lg border border-slate-700">
                    <span className="text-emerald-400 font-bold block mb-1">DirectQuery</span>
                    <p className="text-xs text-slate-400">Actualización en tiempo real. Ideal para ver cambios instantáneos al usar el Laboratorio SQL.</p>
                  </div>
                  <div className="flex-1 p-3 bg-slate-900/80 rounded-lg border border-slate-700">
                    <span className="text-blue-400 font-bold block mb-1">Importar</span>
                    <p className="text-xs text-slate-400">Mayor rendimiento en reportes grandes. Requiere actualización manual.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Layout size={20} className="text-emerald-400" /> Tablas Críticas para BI
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Ventas", "Detalle_ventas", "Compras", "Detalle_compras", "Inventario", "Productos", "Movimientos_inventario"].map(table => (
                <div key={table} className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg text-xs text-slate-300 border border-slate-700/50">
                  <CheckCircle2 size={12} className="text-emerald-500" /> {table}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-2xl p-6">
            <h3 className="text-yellow-500 font-bold mb-3 flex items-center gap-2">
              <ExternalLink size={18} /> Power BI Service
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Si deseas publicar tu reporte en la nube (app.powerbi.com), asegúrate de instalar <b>On-premises Data Gateway</b> en este equipo para que Power BI pueda acceder a tu SQL Server local.
            </p>
            <button className="w-full mt-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold transition-colors">
              DESCARGAR GATEWAY
            </button>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-200 font-bold mb-3">Soporte de API</h3>
            <p className="text-xs text-slate-500 mb-4">También puedes consumir los datos vía Web usando estos endpoints:</p>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="p-2 bg-black rounded border border-slate-800 text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">
                /api/lists?path=/sales
              </div>
              <div className="p-2 bg-black rounded border border-slate-800 text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">
                /api/lists?path=/purchases
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
