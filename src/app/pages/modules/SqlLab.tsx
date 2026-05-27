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

  const REAL_DATA = {
    names: ["Juan", "María", "Carlos", "Ana", "Luis", "Laura", "Pedro", "Elena", "José", "Rosa"],
    lastnames: ["Pérez", "García", "Rodríguez", "Martínez", "Sánchez", "Flores", "Quispe", "Mamani", "Vargas", "Castillo"],
    companies: ["Distribuidora San Juan", "Abarrotes El Porvenir", "Limpieza Total S.A.C.", "Bebidas del Sur", "Lácteos La Pradera", "Mundo Fresco", "Hogar y Salud", "Distribuciones Express"],
    categories: [
      { name: "Abarrotes", products: ["Arroz Extra 5kg", "Azúcar Rubia 1kg", "Aceite Vegetal 1L", "Fideos Tallarín 500g", "Lentejas 500g"] },
      { name: "Limpieza", products: ["Detergente 1kg", "Jabón Líquido 500ml", "Desinfectante Pino 1L", "Lejía 1L", "Papel Higiénico 4u"] },
      { name: "Bebidas", products: ["Agua Mineral 2L", "Gaseosa 3L", "Cerveza 650ml", "Jugo de Naranja 1L", "Bebida Energética"] },
      { name: "Lácteos", products: ["Leche Evaporada", "Queso Fresco 500g", "Yogur de Fresa 1L", "Mantequilla 200g", "Crema de Leche"] }
    ],
    customer_types: ["Cliente Final", "Minorista", "Mayorista", "Corporativo"]
  };

  const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  const runFullCycle = async () => {
    setIsRunning(true);
    setLogs([]);
    const suffix = Math.floor(Math.random() * 1000);

    try {
      // 0. Crear Empleado
      const empName = getRandom(REAL_DATA.names);
      const empLast = getRandom(REAL_DATA.lastnames);
      addLog("0. Crear Empleado", `INSERT INTO Empleados (id_rol, nombres...) VALUES (1, '${empName} ${empLast}'...)`, "Gestión de seguridad y roles.", "pending");
      let res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/employees", 
          formData: { id_rol: 1, dni: `9${suffix}`.padStart(8, '0'), nombres: empName, apellidos: empLast, telefono: "900000000", direccion: "Calle Principal 123", correo: `e${suffix}@tienda.com`, usuario: `user${suffix}`, password: "123" } 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 600));

      // 1. Crear Rubros y Categorías
      const selectedCat = getRandom(REAL_DATA.categories);
      addLog("1. Crear Rubro de Proveedor", `INSERT INTO Rubro_proveedor (nombre_rubro) VALUES ('${selectedCat.name}')`, "Inserción en catálogos.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: "/supplier-categories", formData: { nombre_rubro: selectedCat.name } })
      });
      if (!res.ok && !(await res.json()).error.includes("ya existe")) throw new Error("Error creando rubro");
      updateLastLog("success");

      addLog("2. Crear Categoría de Producto", `INSERT INTO Categoria (nombre_categoria) VALUES ('${selectedCat.name}')`, "Sincronización de catálogos.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: "/categories", formData: { nombre_categoria: selectedCat.name } })
      });
      if (!res.ok && !(await res.json()).error.includes("ya existe")) throw new Error("Error creando categoría");
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 600));

      // 3. Crear Tipo Cliente
      const tcName = getRandom(REAL_DATA.customer_types);
      addLog("3. Crear Tipo de Cliente", `INSERT INTO Tipo_cliente (nombre_tipo) VALUES ('${tcName}')`, "Configuración de perfiles de cliente.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: "/customer-types", formData: { nombre_tipo: tcName } })
      });
      if (!res.ok && !(await res.json()).error.includes("ya existe")) throw new Error("Error creando tipo cliente");
      updateLastLog("success");

      // Obtener IDs
      const catRes = await fetch(`${API_URL}/api/catalog`);
      const catalog = await catRes.json();
      const rubroId = catalog.rubros.find((r: any) => r.nombre_rubro === selectedCat.name)?.id_rubro;
      const catId = catalog.categorias.find((c: any) => c.nombre_categoria === selectedCat.name)?.id_categoria;
      const tipoId = catalog.tipos_cliente.find((t: any) => t.nombre_tipo === tcName)?.id_tipo_cliente;

      // 4. Crear Proveedor
      const provName = getRandom(REAL_DATA.companies);
      addLog("4. Crear Proveedor", `INSERT INTO Proveedores (razon_social...) VALUES ('${provName}'...)`, "Relación FK con Rubro_proveedor.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/suppliers", 
          formData: { id_rubro: rubroId, ruc: `20${suffix}77777`, razon_social: `${provName} ${suffix}`, representante_legal: `${getRandom(REAL_DATA.names)} ${getRandom(REAL_DATA.lastnames)}`, telefono: "988777666", correo: `ventas@${suffix}prov.com`, direccion: "Zona Industrial" } 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");

      // 5. Crear Cliente
      const cliName = getRandom(REAL_DATA.names);
      const cliLast = getRandom(REAL_DATA.lastnames);
      addLog("5. Crear Cliente", `INSERT INTO Clientes (nombres...) VALUES ('${cliName} ${cliLast}'...)`, "Registro de base de clientes.", "pending");
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/customers", 
          formData: { id_tipo_cliente: tipoId, dni: `${suffix}`.padStart(8, '1'), nombres: cliName, apellidos: cliLast, telefono: "911222333", correo: `cli${suffix}@email.com`, direccion: "Av. Las Flores 456" } 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");

      // 6. Crear Productos Reales
      addLog("6. Crear Productos", `INSERT INTO Productos (nombre_producto...) VALUES (...)`, "Carga de catálogo maestro de productos.", "pending");
      const createdProdIds: number[] = [];
      for (const pName of selectedCat.products.slice(0, 3)) {
        const cost = Math.floor(Math.random() * 20) + 5;
        res = await fetch(`${API_URL}/api/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            path: "/products", 
            formData: { id_categoria: catId, nombre_producto: pName, precio_compra: cost, precio_venta: Math.round(cost * 1.3) } 
          })
        });
        if (res.ok) {
           const catalogReload = await (await fetch(`${API_URL}/api/catalog`)).json();
           const pid = catalogReload.productos.find((p: any) => p.nombre_producto === pName)?.id_producto;
           if (pid) createdProdIds.push(pid);
        }
      }
      updateLastLog("success");
      await new Promise(r => setTimeout(r, 600));

      const catalogFinal = await (await fetch(`${API_URL}/api/catalog`)).json();
      const provId = catalogFinal.proveedores.find((p: any) => p.razon_social.includes(provName))?.id_proveedor;
      const cliId = catalogFinal.clientes.find((c: any) => c.dni === `${suffix}`.padStart(8, '1'))?.id_cliente;

      // 7. Compra Multi-Producto
      addLog("7. Registrar Compra (Multi-item)", `EXEC sp_RegistrarCompra @id_proveedor=${provId}...`, "Simulación de abastecimiento coherente con el rubro.", "pending");
      const purchaseDetails = createdProdIds.map(pid => ({
        id_producto: pid,
        cantidad: Math.floor(Math.random() * 20) + 10,
        costo_unitario: catalogFinal.productos.find((p: any) => p.id_producto === pid).precio_compra
      }));
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/purchases", user_id: 1,
          formData: { id_proveedor: provId, id_metodo_pago: 1, id_igv: 1 },
          details: purchaseDetails
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");

      // 8. Venta Multi-Producto
      addLog("8. Registrar Venta (Multi-item)", `EXEC sp_RegistrarVenta @id_cliente=${cliId}...`, "Simulación de flujo de caja y salida de stock.", "pending");
      const saleDetails = createdProdIds.slice(0, 2).map(pid => ({
        id_producto: pid,
        cantidad: Math.floor(Math.random() * 5) + 1,
        precio_unitario: catalogFinal.productos.find((p: any) => p.id_producto === pid).precio_venta
      }));
      res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: "/sales", user_id: 1,
          formData: { id_cliente: cliId, id_metodo_pago: 1, id_igv: 1 },
          details: saleDetails
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      updateLastLog("success");

    } catch (err: any) {
      updateLastLog("error", err.message);
    }
    setIsRunning(false);
  };

  const runQuickSales = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog("Iniciando Ventas Reales", "FETCH /api/catalog...", "Generando actividad con datos existentes.", "pending");
    try {
      const catRes = await fetch(`${API_URL}/api/catalog`);
      const catalog = await catRes.json();
      if (!catalog.clientes.length || !catalog.productos.length) throw new Error("Se requieren datos previos.");
      updateLastLog("success");

      for (let i = 1; i <= 3; i++) {
        const randomCli = getRandom(catalog.clientes);
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [...catalog.productos].sort(() => 0.5 - Math.random()).slice(0, numItems);
        
        addLog(`Venta #${i} (${numItems} productos)`, `EXEC sp_RegistrarVenta...`, `Venta para ${randomCli.nombres}`, "pending");
        const details = selectedProducts.map(p => ({
          id_producto: p.id_producto,
          cantidad: Math.floor(Math.random() * 3) + 1,
          precio_unitario: p.precio_venta
        }));

        const res = await fetch(`${API_URL}/api/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            path: "/sales", user_id: 1,
            formData: { id_cliente: randomCli.id_cliente, id_metodo_pago: 1, id_igv: 1 },
            details: details
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
