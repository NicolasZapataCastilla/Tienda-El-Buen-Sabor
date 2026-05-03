import React, { useState } from 'react';
import { API_URL } from '../../../api.config';
import { Play, Database, FileCode, CheckCircle2, AlertCircle, Info, Layers, Zap, Trash2, X } from 'lucide-react';

export const SqlLab = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [mathChallenge, setMathChallenge] = useState({ a: 0, b: 0, answer: '' });

  const addLog = (label: string, sql: string, explanation: string, status: 'pending' | 'success' | 'error', error?: string) => {
    setLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      label, sql, explanation, status, error
    }, ...prev]);
  };

  const updateLastLog = (status: 'success' | 'error', error?: string) => {
    setLogs(prev => {
      const updated = [...prev];
      updated[0].status = status;
      if (error) updated[0].error = error;
      return updated;
    });
  };

  const handleOpenReset = () => {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 20) + 5;
    setMathChallenge({ a, b, answer: '' });
    setShowResetModal(true);
  };

  const handleResetDB = async () => {
    if (parseInt(mathChallenge.answer) !== (mathChallenge.a + mathChallenge.b)) {
      alert("Resultado incorrecto. Inténtalo de nuevo.");
      return;
    }

    setIsRunning(true);
    setShowResetModal(false);
    setLogs([]);
    addLog("Iniciando Vaciado de Base de Datos", "DELETE FROM [Tablas]...", "Borrando datos transaccionales y maestros (excepto Admin/Config).", "pending");

    try {
      const res = await fetch(`${API_URL}/api/reset-db`, { method: 'POST' });
      if (res.ok) {
        updateLastLog("success");
        addLog("Reseteo Completado", "DBCC CHECKIDENT (RESEED)...", "Los contadores de ID han vuelto a 0.", "success");
      } else {
        updateLastLog("error", (await res.json()).error);
      }
    } catch (err: any) {
      updateLastLog("error", err.message);
    }
    setIsRunning(false);
  };

  const runFullCycle = async () => {
    setIsRunning(true);
    setLogs([]);
    const suffix = Math.floor(Math.random() * 10000);

    try {
      // 0. Crear Empleado
      addLog("0. Crear Empleado", `INSERT INTO Empleados (id_rol, dni, usuario...) VALUES (1, ...)`, "Requisito: Gestión de seguridad y roles.", "pending");
      let res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/employees", 
          formData: { id_rol: 1, dni: `9${suffix}`.padStart(8, '0'), nombres: `User ${suffix}`, apellidos: "Demo", telefono: "900000000", direccion: "Dir Emp", correo: `e${suffix}@test.com`, usuario: `user${suffix}`, password: "123" } 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 800));

      // 1. Crear Rubro
      addLog("1. Crear Rubro de Proveedor", `INSERT INTO Rubro_proveedor (nombre_rubro) VALUES ('Rubro ${suffix}')`, "Cumple requisito: Inserción en catálogos.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: "/supplier-categories", formData: { nombre_rubro: `Rubro ${suffix}` } })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 800));

      // 2. Crear Tipo Cliente
      addLog("2. Crear Tipo de Cliente", `INSERT INTO Tipo_cliente (nombre_tipo) VALUES ('Tipo ${suffix}')`, "Cumple requisito: Inserción en catálogos obligatorios.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: "/customer-types", formData: { nombre_tipo: `Tipo ${suffix}` } })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 800));

      // 3. Crear Categoría
      addLog("3. Crear Categoría", `INSERT INTO Categoria (nombre_categoria) VALUES ('Cat ${suffix}')`, "Cumple requisito: Inserción de datos de ejemplo.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: "/categories", formData: { nombre_categoria: `Cat ${suffix}` } })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 800));

      const catRes = await fetch(`${API_URL}/api/catalog`);
      const catalog = await catRes.json();
      const rubroId = catalog.rubros.find((r: any) => r.nombre_rubro === `Rubro ${suffix}`)?.id_rubro;
      const tipoId = catalog.tipos_cliente.find((t: any) => t.nombre_tipo === `Tipo ${suffix}`)?.id_tipo_cliente;
      const catId = catalog.categorias.find((c: any) => c.nombre_categoria === `Cat ${suffix}`)?.id_categoria;

      if (!rubroId || !tipoId || !catId) throw new Error("No se pudieron recuperar los IDs de los catálogos creados.");

      // 4. Crear Proveedor
      addLog("4. Crear Proveedor", `INSERT INTO Proveedores (id_rubro...) VALUES (${rubroId}, ...)`, "Demuestra relación FK con Rubro_proveedor.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/suppliers", 
          formData: { id_rubro: rubroId, ruc: `20${suffix}12345`, razon_social: `Prov ${suffix}`, representante_legal: "Rep Demo", telefono: "999888777", correo: `p${suffix}@test.com`, direccion: "Dir 123" } 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 800));

      // 5. Crear Cliente
      addLog("5. Crear Cliente", `INSERT INTO Clientes (id_tipo_cliente...) VALUES (${tipoId}, ...)`, "Tabla obligatoria con relación a Tipo_cliente.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/customers", 
          formData: { id_tipo_cliente: tipoId, dni: `${suffix}`.padStart(8, '0'), nombres: `Cliente ${suffix}`, apellidos: "Demo", telefono: "911222333", correo: `c${suffix}@test.com`, direccion: "Calle Real" } 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 800));

      // 6. Crear Producto
      addLog("6. Crear Producto", `INSERT INTO Productos (id_categoria...) VALUES (${catId}, ...)`, "Tabla obligatoria. Activa trigger/lógica de Inventario.", "pending");
      const randomCost = Math.floor(Math.random() * 40) + 5;
      const randomPrice = Math.floor(randomCost * 1.5);
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/products", 
          formData: { id_categoria: catId, nombre_producto: `Prod ${suffix}`, precio_compra: randomCost, precio_venta: randomPrice } 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 800));

      const catRes2 = await fetch(`${API_URL}/api/catalog`);
      const catalog2 = await catRes2.json();
      const provId = catalog2.proveedores.find((p: any) => p.razon_social === `Prov ${suffix}`)?.id_proveedor;
      const cliId = catalog2.clientes.find((c: any) => c.dni === `${suffix}`.padStart(8, '0'))?.id_cliente;
      const prodId = catalog2.productos.find((p: any) => p.nombre_producto === `Prod ${suffix}`)?.id_producto;

      for (let i = 1; i <= 2; i++) {
        const qtyPurchase = Math.floor(Math.random() * 15) + 5;
        addLog(`7.${i} Registrar Compra #${i}`, `EXEC sp_RegistrarCompra @id_proveedor=${provId}, @cantidad=${qtyPurchase}...`, "Simulación de abastecimiento múltiple.", "pending");
        res = await fetch(`${API_URL}/api/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            path: "/purchases", user_id: 1,
            formData: { id_proveedor: provId, id_metodo_pago: 1, id_igv: 1 },
            details: [{ id_producto: prodId, cantidad: qtyPurchase, costo_unitario: randomCost }]
          })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        updateLastLog("success");
        await new Promise(r => setTimeout(r, 800));

        const qtySale = Math.floor(Math.random() * 4) + 1;
        addLog(`8.${i} Registrar Venta #${i}`, `EXEC sp_RegistrarVenta @id_cliente=${cliId}, @cantidad=${qtySale}...`, "Simulación de generación de ingresos.", "pending");
        res = await fetch(`${API_URL}/api/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            path: "/sales", user_id: 1,
            formData: { id_cliente: cliId, id_metodo_pago: 1, id_igv: 1 },
            details: [{ id_producto: prodId, cantidad: qtySale, precio_unitario: randomPrice }]
          })
        });
        if (!res.ok) throw new Error((await res.json()).error);
        updateLastLog("success");
        await new Promise(r => setTimeout(r, 800));
      }

    } catch (err: any) {
      updateLastLog("error", err.message);
    }
    setIsRunning(false);
  };

  const runQuickSales = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog("Iniciando Simulación Rápida", "FETCH /api/catalog...", "Obteniendo datos para simular actividad.", "pending");
    try {
      const catRes = await fetch(`${API_URL}/api/catalog`);
      const catalog = await catRes.json();
      if (!catalog.clientes.length || !catalog.productos.length) throw new Error("Se necesitan clientes y productos previos.");
      updateLastLog("success");

      for (let i = 1; i <= 5; i++) {
        const randomCli = catalog.clientes[Math.floor(Math.random() * catalog.clientes.length)];
        const randomProd = catalog.productos[Math.floor(Math.random() * catalog.productos.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        addLog(`Venta Rápida #${i}`, `EXEC sp_RegistrarVenta...`, "Generando tráfico aleatorio.", "pending");
        const res = await fetch(`${API_URL}/api/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            path: "/sales", user_id: 1,
            formData: { id_cliente: randomCli.id_cliente, id_metodo_pago: 1, id_igv: 1 },
            details: [{ id_producto: randomProd.id_producto, cantidad: qty, precio_unitario: randomProd.precio_venta }]
          })
        });
        if (res.ok) updateLastLog("success");
        else updateLastLog("error", (await res.json()).error);
        await new Promise(r => setTimeout(r, 600));
      }
    } catch (err: any) {
      updateLastLog("error", err.message);
    }
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="text-blue-400" /> Laboratorio SQL & Automatización
          </h1>
          <p className="text-slate-400 text-sm mt-1">Simulación integral de procesos para la evaluación final.</p>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={isRunning}
            onClick={handleOpenReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl transition-all font-medium text-sm"
          >
            <Trash2 size={16} /> VACIAR DATOS
          </button>
          <button 
            disabled={isRunning}
            onClick={runQuickSales}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 rounded-xl transition-all font-medium text-sm"
          >
            <Zap size={16} /> RÁFAGA DE VENTAS
          </button>
          <button 
            disabled={isRunning}
            onClick={runFullCycle}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20"
          >
            <Play size={18} /> EJECUTAR CICLO MAESTRO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Layers size={16} className="text-blue-400" /> Cobertura del Curso
            </h2>
            <ul className="space-y-3">
              {["Uso de PK/FK (Relaciones)", "Sentencias INSERT masivas", "Procedimientos Almacenados", "Gestión de Transacciones", "Actualización de Stock", "Integración con Frontend"].map((text, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 size={12} className="text-emerald-500" /> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col h-[650px] bg-[#050505] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2"><FileCode size={14} /> SQL TERMINAL OUTPUT</span>
            <button onClick={() => setLogs([])} className="text-[10px] text-slate-500 hover:text-slate-300 uppercase">Limpiar</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm custom-scrollbar">
            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700">
                <Database size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium opacity-40">Inicia una simulación para ver la actividad</p>
              </div>
            )}
            {logs.map((log, i) => (
              <div key={i} className={`p-4 rounded-xl border-l-4 animate-in slide-in-from-left-4 duration-300 ${log.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/50' : log.status === 'error' ? 'bg-red-500/5 border-red-500/50' : 'bg-blue-500/5 border-blue-500/50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : log.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{log.label}</span>
                  <span className="text-[10px] text-slate-600">{log.timestamp}</span>
                </div>
                <div className="bg-[#0a0a0a] p-4 rounded-lg border border-slate-800/50 mb-3 shadow-inner">
                  <pre className="text-blue-300 whitespace-pre-wrap"><span className="text-emerald-500">SQL {'>'} </span>{log.sql}</pre>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Info size={14} className="text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-slate-300 font-medium italic">{log.explanation}</p>
                    {log.status === 'error' && <p className="text-red-400 mt-2 font-bold p-2 bg-red-500/10 rounded border border-red-500/20">ERROR DB: {log.error}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle size={24} />
                <h3 className="text-xl font-bold text-slate-100">Confirmación Crítica</h3>
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Esta acción eliminará todos los registros de ventas, compras, productos y clientes. 
              Los contadores volverán a 0. Solo se conservará la configuración base y el usuario admin.
            </p>

            <div className="bg-black/40 border border-slate-800 rounded-xl p-4 mb-6 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Reto de Seguridad</p>
              <div className="flex items-center justify-center gap-4 text-2xl font-bold text-slate-100">
                <span>{mathChallenge.a}</span>
                <span className="text-blue-400">+</span>
                <span>{mathChallenge.b}</span>
                <span className="text-slate-500">=</span>
                <input 
                  type="number"
                  value={mathChallenge.answer}
                  onChange={(e) => setMathChallenge({...mathChallenge, answer: e.target.value})}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none py-1"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowResetModal(false)} className="flex-1 py-3 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors font-medium">Cancelar</button>
              <button onClick={handleResetDB} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-red-600/20">VACIAR AHORA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
