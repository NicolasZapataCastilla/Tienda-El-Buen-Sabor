import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, X, PlusCircle, Trash2 } from 'lucide-react';
import { API } from '../../data/mockData';
import { db } from '../../data/db';

export const ModuleForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessibleModules, user } = useAuth();
  
  const basePath = location.pathname.split('/').slice(0, 2).join('/');
  const moduleConfig = accessibleModules.find(m => m.path === basePath);
  const title = moduleConfig?.name || basePath.replace('/', '').toUpperCase();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [details, setDetails] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [catalogs, setCatalogs] = useState<any>({
    clientes: [], proveedores: [], metodos_pago: [], igvs: [], 
    productos: [], categorias: [], roles: [], rubros: [], 
    tipos_cliente: [], inventario: []
  });

  React.useEffect(() => {
    fetch('http://localhost:3000/api/catalog')
      .then(res => res.json())
      .then(data => setCatalogs(data))
      .catch(err => console.error("Error fetching catalog: ", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDetailChange = (index: number, field: string, value: string) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    
    if(field === 'id_producto') {
      const prod = catalogs.productos.find(p => String(p.id_producto) === String(value));
      if(prod) {
        if(basePath === '/sales') newDetails[index]['precio_unitario'] = parseFloat(prod.precio_venta) || 0;
        if(basePath === '/purchases') newDetails[index]['costo_unitario'] = parseFloat(prod.precio_compra) || 0;
      }
    }
    
    setDetails(newDetails);
  };

  const addDetail = () => {
    if(basePath === '/sales') {
      setDetails([...details, { id_producto: '', cantidad: 1, precio_unitario: 0 }]);
    } else {
      setDetails([...details, { id_producto: '', cantidad: 1, costo_unitario: 0 }]);
    }
  };

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    details.forEach(d => {
      const qty = parseFloat(d.cantidad || '0');
      const price = parseFloat(basePath === '/sales' ? d.precio_unitario : d.costo_unitario) || 0;
      subtotal += qty * price;
    });
    const igvObj = catalogs.igvs?.find(i => String(i.id_igv) === String(formData.id_igv));
    const rate = igvObj ? igvObj.porcentaje : 0;
    const monto_igv = subtotal * rate;
    return { subtotal, monto_igv, total: subtotal + monto_igv };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isTransaction && details.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }
    
    if (isTransaction) {
      for (const d of details) {
        if (parseFloat(d.cantidad || '0') <= 0) {
          setError('La cantidad debe ser mayor a 0 en todos los productos.');
          return;
        }
      }
      
      if (basePath === '/sales') {
        const productQuantities: Record<string, number> = {};
        for (const d of details) {
           productQuantities[d.id_producto] = (productQuantities[d.id_producto] || 0) + parseFloat(d.cantidad || '0');
        }
        for (const [id_prod, totalQty] of Object.entries(productQuantities)) {
           const inv = catalogs.inventario.find(i => String(i.id_producto) === String(id_prod));
           const prod = catalogs.productos.find(p => String(p.id_producto) === String(id_prod));
           if (!inv || inv.stock_actual < totalQty) {
              setError(`Stock insuficiente para: ${prod?.nombre_producto || 'Desconocido'}. Solicitado: ${totalQty}, Disp: ${inv?.stock_actual || 0}`);
              return;
           }
        }
      }
    }

    try {
      const res = await fetch(`http://localhost:3000/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: basePath, formData, details, user_id: user?.employee_id || 1 })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error guardando registro');
      }
      navigate(basePath);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor SQL');
    }
  };

  const renderFields = () => {
    switch (basePath) {
      case '/sales':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Cliente *</label>
                <select name="id_cliente" value={formData.id_cliente || ''} onChange={handleChange} required className="form-select">
                  <option value="">Seleccione Cliente</option>
                  {catalogs.clientes.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Método de Pago *</label>
                <select name="id_metodo_pago" value={formData.id_metodo_pago || ''} onChange={handleChange} required className="form-select">
                  <option value="">Seleccione Método</option>
                  {catalogs.metodos_pago.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(m => (
                    <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">IGV *</label>
                <select name="id_igv" value={formData.id_igv || ''} onChange={handleChange} required className="form-select">
                  <option value="">Seleccione IGV</option>
                  {catalogs.igvs.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(i => (
                    <option key={i.id_igv} value={i.id_igv}>IGV {(i.porcentaje * 100).toFixed(0)}%</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
      case '/purchases':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Proveedor *</label>
                <select name="id_proveedor" value={formData.id_proveedor || ''} onChange={handleChange} required className="form-select">
                  <option value="">Seleccione Proveedor</option>
                  {catalogs.proveedores.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(p => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Método de Pago *</label>
                <select name="id_metodo_pago" value={formData.id_metodo_pago || ''} onChange={handleChange} required className="form-select">
                  <option value="">Seleccione Método</option>
                  {catalogs.metodos_pago.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(m => (
                    <option key={m.id_metodo_pago} value={m.id_metodo_pago}>{m.nombre_metodo}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">IGV *</label>
                <select name="id_igv" value={formData.id_igv || ''} onChange={handleChange} required className="form-select">
                  <option value="">Seleccione IGV</option>
                  {catalogs.igvs.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(i => (
                    <option key={i.id_igv} value={i.id_igv}>IGV {(i.porcentaje * 100).toFixed(0)}%</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
      case '/customers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">DNI * (8 dígitos)</label><input type="text" name="dni" required pattern="\d{8}" maxLength={8} minLength={8} title="Debe contener exactamente 8 dígitos" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Nombres *</label><input type="text" name="nombres" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Apellidos *</label><input type="text" name="apellidos" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Teléfono * (9 dígitos, empiece en 9)</label><input type="text" name="telefono" required pattern="9\d{8}" maxLength={9} minLength={9} title="Debe contener 9 dígitos y empezar con 9" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Correo *</label><input type="email" name="correo" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Ingrese un correo válido ej: usuario@correo.com" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Dirección *</label><input type="text" name="direccion" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tipo de Cliente *</label>
                <select name="id_tipo_cliente" required onChange={handleChange} className="form-select">
                  <option value="">Seleccione</option>
                  {catalogs.tipos_cliente.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(t => <option key={t.id_tipo_cliente} value={t.id_tipo_cliente}>{t.nombre_tipo}</option>)}
                </select>
            </div>
          </div>
        );
      case '/suppliers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">RUC * (11 dígitos)</label><input type="text" name="ruc" required pattern="\d{11}" maxLength={11} minLength={11} title="Debe contener exactamente 11 dígitos" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Razón Social *</label><input type="text" name="razon_social" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Rep. Legal *</label><input type="text" name="representante_legal" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Rubro *</label>
                <select name="id_rubro" required onChange={handleChange} className="form-select">
                  <option value="">Seleccione</option>
                  {catalogs.rubros.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(r => <option key={r.id_rubro} value={r.id_rubro}>{r.nombre_rubro}</option>)}
                </select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Teléfono * (9 dígitos, empiece en 9)</label><input type="text" name="telefono" required pattern="9\d{8}" maxLength={9} minLength={9} title="Debe contener 9 dígitos y empezar con 9" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Correo *</label><input type="email" name="correo" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Ingrese un correo válido ej: usuario@correo.com" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Dirección *</label><input type="text" name="direccion" required onChange={handleChange} className="form-input" /></div>
          </div>
        );
      case '/products':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Nombre *</label><input type="text" name="nombre_producto" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Categoría *</label>
                <select name="id_categoria" required onChange={handleChange} className="form-select">
                  <option value="">Seleccione</option>
                  {catalogs.categorias.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
                </select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Precio Compra *</label><input type="number" step="0.01" min="0.01" name="precio_compra" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Precio Venta *</label><input type="number" step="0.01" min="0.01" name="precio_venta" required onChange={handleChange} className="form-input" /></div>
          </div>
        );
      case '/customer-types':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Nombre del Tipo *</label><input type="text" name="nombre_tipo" required onChange={handleChange} className="form-input" /></div>
          </div>
        );
      case '/categories':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Nombre Categoría *</label><input type="text" name="nombre_categoria" required onChange={handleChange} className="form-input" /></div>
          </div>
        );
      case '/supplier-categories':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Nombre Rubro *</label><input type="text" name="nombre_rubro" required onChange={handleChange} className="form-input" /></div>
          </div>
        );
      case '/employees':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">DNI * (8 dígitos)</label><input type="text" name="dni" required pattern="\d{8}" maxLength={8} minLength={8} title="Debe contener exactamente 8 dígitos" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Nombres *</label><input type="text" name="nombres" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Apellidos *</label><input type="text" name="apellidos" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Rol *</label>
                <select name="id_rol" required onChange={handleChange} className="form-select">
                  <option value="">Seleccione</option>
                  {catalogs.roles.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                </select>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Teléfono * (9 dígitos, empiece en 9)</label><input type="text" name="telefono" required pattern="9\d{8}" maxLength={9} minLength={9} title="Debe contener 9 dígitos y empezar con 9" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Correo *</label><input type="email" name="correo" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" title="Ingrese un correo válido ej: usuario@correo.com" onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Dirección *</label><input type="text" name="direccion" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Usuario *</label><input type="text" name="usuario" required onChange={handleChange} className="form-input" /></div>
            <div className="space-y-2"><label className="text-sm font-medium text-slate-300">Contraseña *</label><input type="password" name="password" required onChange={handleChange} className="form-input" /></div>
          </div>
        );
      default:
        return <p className="text-slate-400">Configuración de formulario no encontrada.</p>;
    }
  };

  const isTransaction = basePath === '/sales' || basePath === '/purchases';
  const totals = isTransaction ? calculateTotals() : { subtotal: 0, monto_igv: 0, total: 0 };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(basePath)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700/50">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Crear {title}</h1>
            <p className="text-slate-400 text-sm mt-1">Complete los detalles requeridos.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <style>{`
        .form-input { width: 100%; padding: 0.625rem 1rem; background-color: #0a0a0a; border: 1px solid #334155; border-radius: 0.75rem; color: #e2e8f0; transition: all 0.2s; }
        .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        .form-select { width: 100%; padding: 0.625rem 1rem; background-color: #0a0a0a; border: 1px solid #334155; border-radius: 0.75rem; color: #e2e8f0; appearance: none; }
        .form-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm p-6">
          <h2 className="text-lg font-medium text-slate-200 mb-4 border-b border-slate-800 pb-2">Información Principal</h2>
          {renderFields()}
        </div>

        {isTransaction && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
              <h2 className="text-lg font-medium text-slate-200">Detalle de Productos</h2>
              <button type="button" onClick={addDetail} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                <PlusCircle size={16} /> Agregar Producto
              </button>
            </div>
            
            <div className="space-y-4">
              {details.map((d, index) => (
                <div key={index} className="flex gap-4 items-start bg-[#0a0a0a]/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-slate-400">Producto</label>
                    <select value={d.id_producto} required onChange={(e) => handleDetailChange(index, 'id_producto', e.target.value)} className="form-select text-sm py-2">
                      <option value="">Seleccione</option>
                      {catalogs.productos.filter(x => x.estado?.toUpperCase() === 'ACTIVO').map(p => {
                        const inv = catalogs.inventario.find(i => String(i.id_producto) === String(p.id_producto));
                        return <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto} (Stock: {inv?.stock_actual || 0})</option>;
                      })}
                    </select>
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-xs text-slate-400">Cant</label>
                    <input type="number" min="1" value={d.cantidad} required onChange={(e) => handleDetailChange(index, 'cantidad', e.target.value)} className="form-input text-sm py-2" />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-xs text-slate-400">{basePath === '/sales' ? 'Precio U.' : 'Costo U.'}</label>
                    <input type="number" step="0.01" min="0.01" value={basePath === '/sales' ? d.precio_unitario : d.costo_unitario} readOnly className="form-input text-sm py-2 bg-slate-800/50 cursor-not-allowed text-slate-400" />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-xs text-slate-400">Subtotal</label>
                    <div className="py-2 text-sm text-slate-300 font-mono">
                      S/. {((d.cantidad || 0) * (basePath === '/sales' ? (d.precio_unitario || 0) : (d.costo_unitario || 0))).toFixed(2)}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeDetail(index)} className="mt-6 p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {details.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No hay productos agregados.</p>}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span>Subtotal:</span> <span className="font-mono text-slate-200">S/. {totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>IGV:</span> <span className="font-mono text-slate-200">S/. {totals.monto_igv.toFixed(2)}</span></div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t border-slate-800 text-white"><span>Total:</span> <span className="font-mono text-blue-400">S/. {totals.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate(basePath)} className="flex items-center gap-2 px-6 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors font-medium">
            <X size={18} /> Cancelar
          </button>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-lg shadow-blue-600/20 font-medium">
            <Save size={18} /> Guardar
          </button>
        </div>
      </form>
    </div>
  );
};
