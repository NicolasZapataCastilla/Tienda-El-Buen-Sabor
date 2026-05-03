const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Helper for generic list fetching matching ModuleList's expected format
app.get('/api/lists', async (req, res) => {
  const { path } = req.query;
  try {
    const pool = await poolPromise;
    let query = '';
    
    switch(path) {
      case '/employees':
        query = `SELECT id_empleado as id, dni, nombres, apellidos, telefono, correo, usuario, UPPER(estado) as estado, FORMAT(fecha_creacion, 'dd/MM/yyyy HH:mm') as fecha_creacion FROM Empleados ORDER BY 1 DESC`;
        break;
      case '/sales':
        query = `
          SELECT v.id_venta as id, c.nombres + ' ' + c.apellidos as cliente, e.nombres as empleado,
                 'S/. ' + CAST(v.subtotal as varchar) as subtotal, 'S/. ' + CAST(v.monto_igv as varchar) as monto_igv,
                 'S/. ' + CAST(v.total as varchar) as total, UPPER(v.estado) as estado,
                 FORMAT(v.fecha_venta, 'dd/MM/yyyy HH:mm') as fecha_venta,
                 ISNULL(FORMAT(v.fecha_anulacion, 'dd/MM/yyyy HH:mm'), '-') as fecha_anulacion
          FROM Ventas v
          JOIN Clientes c ON v.id_cliente = c.id_cliente
          JOIN Empleados e ON v.id_empleado = e.id_empleado
          ORDER BY 1 DESC
        `;
        break;
      case '/purchases':
        query = `
          SELECT c.id_compra as id, p.razon_social as proveedor, e.nombres as empleado,
                 'S/. ' + CAST(c.subtotal as varchar) as subtotal, 'S/. ' + CAST(c.monto_igv as varchar) as monto_igv,
                 'S/. ' + CAST(c.total as varchar) as total, UPPER(c.estado) as estado,
                 FORMAT(c.fecha_compra, 'dd/MM/yyyy HH:mm') as fecha_compra,
                 ISNULL(FORMAT(c.fecha_anulacion, 'dd/MM/yyyy HH:mm'), '-') as fecha_anulacion
          FROM Compras c
          JOIN Proveedores p ON c.id_proveedor = p.id_proveedor
          JOIN Empleados e ON c.id_empleado = e.id_empleado
          ORDER BY 1 DESC
        `;
        break;
      case '/suppliers':
        query = `SELECT p.id_proveedor as id, p.ruc, p.razon_social, p.representante_legal, r.nombre_rubro as rubro, p.telefono, p.correo, p.direccion, UPPER(p.estado) as estado, FORMAT(p.fecha_creacion, 'dd/MM/yyyy HH:mm') as fecha_creacion FROM Proveedores p JOIN Rubro_proveedor r ON p.id_rubro = r.id_rubro ORDER BY 1 DESC`;
        break;
      case '/customers':
        query = `SELECT c.id_cliente as id, c.dni, c.nombres, c.apellidos, c.telefono, c.correo, c.direccion, t.nombre_tipo as tipo_cliente, UPPER(c.estado) as estado, FORMAT(c.fecha_creacion, 'dd/MM/yyyy HH:mm') as fecha_creacion FROM Clientes c JOIN Tipo_cliente t ON c.id_tipo_cliente = t.id_tipo_cliente ORDER BY 1 DESC`;
        break;
      case '/products':
        query = `SELECT p.id_producto as id, p.nombre_producto, c.nombre_categoria as categoria, 'S/. ' + CAST(p.precio_compra as varchar) as precio_compra, 'S/. ' + CAST(p.precio_venta as varchar) as precio_venta, UPPER(p.estado) as estado, FORMAT(p.fecha_creacion, 'dd/MM/yyyy HH:mm') as fecha_creacion FROM Productos p JOIN Categoria c ON p.id_categoria = c.id_categoria ORDER BY 1 DESC`;
        break;
      case '/categories':
        query = `SELECT id_categoria as id, nombre_categoria, UPPER(estado) as estado, FORMAT(fecha_creacion, 'dd/MM/yyyy HH:mm') as fecha_creacion FROM Categoria ORDER BY 1 DESC`;
        break;
      case '/customer-types':
        query = `SELECT id_tipo_cliente as id, nombre_tipo, UPPER(estado) as estado, FORMAT(fecha_creacion, 'dd/MM/yyyy HH:mm') as fecha_creacion FROM Tipo_cliente ORDER BY 1 DESC`;
        break;
      case '/supplier-categories':
        query = `SELECT id_rubro as id, nombre_rubro, UPPER(estado) as estado, FORMAT(fecha_creacion, 'dd/MM/yyyy HH:mm') as fecha_creacion FROM Rubro_proveedor ORDER BY 1 DESC`;
        break;
      case '/inventory':
        query = `SELECT i.id_inventario as id, p.nombre_producto as producto, i.stock_actual, i.stock_minimo, i.stock_maximo, UPPER(i.estado) as estado, FORMAT(ISNULL(i.fecha_modificacion, i.fecha_creacion), 'dd/MM/yyyy HH:mm') as fecha_modificacion FROM Inventario i JOIN Productos p ON i.id_producto = p.id_producto ORDER BY 1 DESC`;
        break;
      case '/movements':
        query = `
          SELECT m.id_movimiento as id, p.nombre_producto as producto, m.tipo_movimiento, m.cantidad, m.stock_anterior, m.stock_nuevo, 
                 CASE WHEN m.id_detalle_compra IS NOT NULL THEN 'COMPRA-' + CAST(dc.id_compra as varchar) 
                      WHEN m.id_detalle_venta IS NOT NULL THEN 'VENTA-' + CAST(dv.id_venta as varchar) 
                      ELSE '' END as referencia,
                 FORMAT(m.fecha_movimiento, 'dd/MM/yyyy HH:mm') as fecha_movimiento
          FROM Movimientos_inventario m
          JOIN Productos p ON m.id_producto = p.id_producto
          LEFT JOIN Detalle_compras dc ON m.id_detalle_compra = dc.id_detalle_compra
          LEFT JOIN Detalle_ventas dv ON m.id_detalle_venta = dv.id_detalle_venta
          ORDER BY 1 DESC
        `;
        break;
      case '/payments':
        query = `
          SELECT pg.id_pago as id,
                 CASE WHEN pg.id_venta IS NOT NULL THEN 'VENTA-' + CAST(pg.id_venta as varchar)
                      WHEN pg.id_compra IS NOT NULL THEN 'COMPRA-' + CAST(pg.id_compra as varchar)
                      ELSE '' END as referencia,
                 m.nombre_metodo as metodo_pago,
                 'S/. ' + CAST(pg.monto_pago as varchar) as monto_pago,
                 UPPER(pg.estado) as estado,
                 FORMAT(pg.fecha_pago, 'dd/MM/yyyy HH:mm') as fecha_pago,
                 ISNULL(FORMAT(pg.fecha_anulacion, 'dd/MM/yyyy HH:mm'), '-') as fecha_anulacion
          FROM Pagos pg
          JOIN Metodo_pago m ON pg.id_metodo_pago = m.id_metodo_pago
          ORDER BY 1 DESC
        `;
        break;
      case '/consolidated':
        // Simulating the consolidated view
        query = `
          SELECT 'COMPRA-' + CAST(c.id_compra as varchar) as id, 'COMPRA' as tipo, p.razon_social as tercero, 'S/. ' + CAST(c.total as varchar) as monto_total, UPPER(c.estado) as estado, FORMAT(c.fecha_compra, 'dd/MM/yyyy HH:mm') as fecha
          FROM Compras c JOIN Proveedores p ON c.id_proveedor = p.id_proveedor
          UNION ALL
          SELECT 'VENTA-' + CAST(v.id_venta as varchar) as id, 'VENTA' as tipo, cl.nombres + ' ' + cl.apellidos as tercero, 'S/. ' + CAST(v.total as varchar) as monto_total, UPPER(v.estado) as estado, FORMAT(v.fecha_venta, 'dd/MM/yyyy HH:mm') as fecha
          FROM Ventas v JOIN Clientes cl ON v.id_cliente = cl.id_cliente
          ORDER BY fecha DESC
        `;
        break;
      default:
        return res.json([]);
    }
    
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for details
app.get('/api/details', async (req, res) => {
  const { path, id } = req.query;
  const numericId = parseInt(id);
  try {
    const pool = await poolPromise;
    let query = '';
    if (path === '/sales') {
      query = `SELECT p.nombre_producto, d.cantidad, 'S/. ' + CAST(d.precio_unitario as varchar) as precio_unitario, 'S/. ' + CAST(d.subtotal as varchar) as subtotal FROM Detalle_ventas d JOIN Productos p ON d.id_producto = p.id_producto WHERE d.id_venta = ${numericId}`;
    } else if (path === '/purchases') {
      query = `SELECT p.nombre_producto, d.cantidad, 'S/. ' + CAST(d.costo_unitario as varchar) as costo_unitario, 'S/. ' + CAST(d.subtotal as varchar) as subtotal FROM Detalle_compras d JOIN Productos p ON d.id_producto = p.id_producto WHERE d.id_compra = ${numericId}`;
    } else {
      return res.json([]);
    }
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full catalogs for forms (Roles, IGV, Metodos de pago, Clientes, etc.)
app.get('/api/catalog', async (req, res) => {
  try {
    const pool = await poolPromise;
    const roles = await pool.request().query("SELECT * FROM Roles");
    const clientes = await pool.request().query("SELECT * FROM Clientes");
    const proveedores = await pool.request().query("SELECT * FROM Proveedores");
    const metodos_pago = await pool.request().query("SELECT * FROM Metodo_pago");
    const igvs = await pool.request().query("SELECT * FROM Igv");
    const productos = await pool.request().query("SELECT * FROM Productos");
    const categorias = await pool.request().query("SELECT * FROM Categoria");
    const rubros = await pool.request().query("SELECT * FROM Rubro_proveedor");
    const tipos_cliente = await pool.request().query("SELECT * FROM Tipo_cliente");
    const inventario = await pool.request().query("SELECT * FROM Inventario");

    res.json({
      roles: roles.recordset,
      clientes: clientes.recordset,
      proveedores: proveedores.recordset,
      productos: productos.recordset,
      categorias: categorias.recordset,
      igvs: igvs.recordset,
      metodos_pago: metodos_pago.recordset,
      rubros: rubros.recordset,
      tipos_cliente: tipos_cliente.recordset,
      inventario: inventario.recordset
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard', async (req, res) => {
  const { role } = req.query;
  try {
    const pool = await poolPromise;
    let metrics = [];
    if (role === 'ADMIN') {
      const vRes = await pool.request().query("SELECT ISNULL(SUM(total), 0) as val FROM Ventas");
      const cRes = await pool.request().query("SELECT ISNULL(SUM(total), 0) as val FROM Compras");
      const uRes = await pool.request().query("SELECT COUNT(*) as val FROM Empleados WHERE estado='ACTIVO'");
      const pRes = await pool.request().query("SELECT COUNT(*) as val FROM Productos WHERE estado='ACTIVO'");
      const pedRes = await pool.request().query("SELECT COUNT(*) as val FROM Ventas");
      
      const v = vRes.recordset[0].val;
      const c = cRes.recordset[0].val;
      metrics = [
        { label: 'Ingresos Totales', value: 'S/. ' + v.toFixed(2), icon: 'DollarSign', trend: 'Tiempo real', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Egresos Totales', value: 'S/. ' + c.toFixed(2), icon: 'TrendingDown', trend: 'Tiempo real', color: 'text-red-400', bg: 'bg-red-400/10' },
        { label: 'Usuarios Activos', value: uRes.recordset[0].val, icon: 'Users', trend: 'Tiempo real', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Productos Totales', value: pRes.recordset[0].val, icon: 'Package', trend: 'Tiempo real', color: 'text-purple-400', bg: 'bg-purple-400/10' }
      ];
    } else if (role === 'SALES_USER') {
      const vRes = await pool.request().query("SELECT ISNULL(SUM(total), 0) as val FROM Ventas");
      const cRes = await pool.request().query("SELECT COUNT(*) as val FROM Clientes WHERE estado='activo'");
      const v = vRes.recordset[0].val;
      metrics = [
        { label: 'Ventas Totales', value: 'S/. ' + v.toFixed(2), icon: 'DollarSign', trend: 'Tiempo real', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Clientes Activos', value: cRes.recordset[0].val, icon: 'Users', trend: 'Tiempo real', color: 'text-blue-400', bg: 'bg-blue-400/10' }
      ];
    } else if (role === 'PURCHASE_USER') {
      const cRes = await pool.request().query("SELECT COUNT(*) as val FROM Compras");
      const pRes = await pool.request().query("SELECT ISNULL(SUM(total), 0) as val FROM Compras");
      const v = pRes.recordset[0].val;
      metrics = [
        { label: 'Compras Realizadas', value: cRes.recordset[0].val, icon: 'ShoppingCart', trend: 'Tiempo real', color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Total Gastado', value: 'S/. ' + v.toFixed(2), icon: 'DollarSign', trend: 'Tiempo real', color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
      ];
    } else if (role === 'INVENTORY_USER') {
      const sRes = await pool.request().query("SELECT COUNT(*) as val FROM Inventario WHERE stock_actual <= stock_minimo");
      const vRes = await pool.request().query("SELECT ISNULL(SUM(i.stock_actual * p.precio_compra), 0) as val FROM Inventario i JOIN Productos p ON i.id_producto = p.id_producto");
      const v = vRes.recordset[0].val;
      metrics = [
        { label: 'Stock Bajo/Mínimo', value: sRes.recordset[0].val, icon: 'Package', trend: 'Requiere atención', color: 'text-red-400', bg: 'bg-red-400/10' },
        { label: 'Valor Invertido', value: 'S/. ' + v.toFixed(2), icon: 'BarChart3', trend: 'Tiempo real', color: 'text-blue-400', bg: 'bg-blue-400/10' }
      ];
    }
    res.json(metrics);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const pool = await poolPromise;
    const query = `
      SELECT e.id_empleado, e.usuario, e.nombres, e.apellidos, r.nombre_rol, e.estado 
      FROM Empleados e
      JOIN Roles r ON e.id_rol = r.id_rol
      WHERE e.usuario = @username AND e.password = @password
    `;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query(query);
      
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    const user = result.recordset[0];
    if (user.estado !== 'activo' && user.estado !== 'ACTIVO') {
      return res.status(401).json({ error: "Usuario inactivo" });
    }
    
    // Map DB roles to frontend roles
    let roleEnum = 'SALES_USER';
    if (user.nombre_rol === 'Administrador') roleEnum = 'ADMIN';
    if (user.nombre_rol === 'Compras') roleEnum = 'PURCHASE_USER';
    if (user.nombre_rol === 'Ventas') roleEnum = 'SALES_USER';
    if (user.nombre_rol === 'Almacen') roleEnum = 'INVENTORY_USER';
    
    res.json({
      id: String(user.id_empleado),
      username: user.usuario,
      name: `${user.nombres} ${user.apellidos}`,
      role: roleEnum,
      employee_id: user.id_empleado
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE ROUTE
app.post('/api/create', async (req, res) => {
  const { path, formData, details, user_id } = req.body;
  try {
    const pool = await poolPromise;
    let query = '';
    
    switch(path) {
      case '/supplier-categories':
        const rCheck = await pool.request().query(`SELECT id_rubro FROM Rubro_proveedor WHERE nombre_rubro = '${formData.nombre_rubro}'`);
        if (rCheck.recordset.length > 0) return res.status(400).json({ error: "El rubro ya existe" });
        query = `INSERT INTO Rubro_proveedor (nombre_rubro, estado) VALUES ('${formData.nombre_rubro}', 'ACTIVO')`;
        break;
      case '/categories':
        const cCheck = await pool.request().query(`SELECT id_categoria FROM Categoria WHERE nombre_categoria = '${formData.nombre_categoria}'`);
        if (cCheck.recordset.length > 0) return res.status(400).json({ error: "La categoría ya existe" });
        query = `INSERT INTO Categoria (nombre_categoria, estado) VALUES ('${formData.nombre_categoria}', 'ACTIVO')`;
        break;
      case '/customer-types':
        const tcCheck = await pool.request().query(`SELECT id_tipo_cliente FROM Tipo_cliente WHERE nombre_tipo = '${formData.nombre_tipo}'`);
        if (tcCheck.recordset.length > 0) return res.status(400).json({ error: "El tipo de cliente ya existe" });
        query = `INSERT INTO Tipo_cliente (nombre_tipo, estado) VALUES ('${formData.nombre_tipo}', 'ACTIVO')`;
        break;
      case '/customers':
        const cliCheck = await pool.request().query(`SELECT id_cliente FROM Clientes WHERE dni = '${formData.dni}' OR correo = '${formData.correo}'`);
        if (cliCheck.recordset.length > 0) return res.status(400).json({ error: "El DNI o correo ya está registrado" });
        query = `INSERT INTO Clientes (dni, nombres, apellidos, telefono, direccion, correo, id_tipo_cliente, estado) 
                 VALUES ('${formData.dni}', '${formData.nombres}', '${formData.apellidos}', '${formData.telefono}', '${formData.direccion}', '${formData.correo}', ${formData.id_tipo_cliente}, 'ACTIVO')`;
        break;
      case '/suppliers':
        const provCheck = await pool.request().query(`SELECT id_proveedor FROM Proveedores WHERE ruc = '${formData.ruc}' OR razon_social = '${formData.razon_social}' OR correo = '${formData.correo}'`);
        if (provCheck.recordset.length > 0) return res.status(400).json({ error: "El RUC, razón social o correo ya está registrado" });
        query = `INSERT INTO Proveedores (id_rubro, ruc, razon_social, representante_legal, telefono, direccion, correo, estado) 
                 VALUES (${formData.id_rubro}, '${formData.ruc}', '${formData.razon_social}', '${formData.representante_legal}', '${formData.telefono}', '${formData.direccion}', '${formData.correo}', 'ACTIVO')`;
        break;
      case '/employees':
        try {
          const empCheckCreate = await pool.request()
            .input('dni', sql.Char(8), formData.dni)
            .input('correo', sql.VarChar(100), formData.correo)
            .input('usuario', sql.VarChar(50), formData.usuario)
            .query(`SELECT id_empleado FROM Empleados WHERE dni = @dni OR correo = @correo OR usuario = @usuario`);
            
          if (empCheckCreate.recordset.length > 0) return res.status(400).json({ error: "El DNI, correo o usuario ya está registrado" });
          
          query = `INSERT INTO Empleados (id_rol, dni, nombres, apellidos, telefono, direccion, correo, usuario, password, estado) 
                   VALUES (@id_rol, @dni, @nombres, @apellidos, @telefono, @direccion, @correo, @usuario, @password, 'ACTIVO')`;
          
          await pool.request()
            .input('id_rol', sql.Int, formData.id_rol)
            .input('dni', sql.Char(8), formData.dni)
            .input('nombres', sql.VarChar(100), formData.nombres)
            .input('apellidos', sql.VarChar(100), formData.apellidos)
            .input('telefono', sql.VarChar(20), formData.telefono)
            .input('direccion', sql.VarChar(255), formData.direccion)
            .input('correo', sql.VarChar(100), formData.correo)
            .input('usuario', sql.VarChar(50), formData.usuario)
            .input('password', sql.VarChar(255), formData.password)
            .query(query);
            
          return res.json({ success: true });
        } catch (err) {
          console.error("Error en /api/create (employees):", err);
          return res.status(500).json({ error: err.message });
        }
      case '/products':
        const prodCheck = await pool.request().query(`SELECT id_producto FROM Productos WHERE nombre_producto = '${formData.nombre_producto}' AND id_categoria = ${formData.id_categoria}`);
        if (prodCheck.recordset.length > 0) return res.status(400).json({ error: "Ya existe un producto con el mismo nombre y categoría" });
        if (parseFloat(formData.precio_compra) <= 0 || parseFloat(formData.precio_venta) <= 0) {
           return res.status(400).json({ error: "Los precios de compra y venta deben ser mayores a 0" });
        }
        query = `
                 BEGIN TRY
                 BEGIN TRAN;
                 INSERT INTO Productos (id_categoria, nombre_producto, precio_compra, precio_venta, estado) 
                 VALUES (${formData.id_categoria}, '${formData.nombre_producto}', ${formData.precio_compra}, ${formData.precio_venta}, 'ACTIVO');
                 DECLARE @newProdId INT = SCOPE_IDENTITY();
                 INSERT INTO Inventario (id_producto, stock_actual, stock_minimo, stock_maximo, estado) VALUES (@newProdId, 0, 10, 500, 'ACTIVO');
                 COMMIT TRAN;
                 END TRY
                 BEGIN CATCH
                 ROLLBACK TRAN;
                 THROW;
                 END CATCH
        `;
        break;
      case '/sales':
      case '/purchases':
        if (!details || details.length === 0) return res.status(400).json({ error: "Debe agregar al menos un producto" });
        let subtotal = 0;
        
        if (path === '/sales') {
          const productQuantities = {};
          for (const d of details) {
             productQuantities[d.id_producto] = (productQuantities[d.id_producto] || 0) + parseInt(d.cantidad);
          }
          for (const [id_prod, totalQty] of Object.entries(productQuantities)) {
             const inv = await pool.request().query(`SELECT stock_actual FROM Inventario WHERE id_producto = ${id_prod}`);
             if (inv.recordset.length === 0 || inv.recordset[0].stock_actual < totalQty) {
                return res.status(400).json({ error: `Stock insuficiente para el producto ID ${id_prod}` });
             }
          }
        }
        
        for (const d of details) {
          const qty = parseInt(d.cantidad);
          if (qty <= 0) return res.status(400).json({ error: "La cantidad debe ser mayor a 0" });
          
          if (path === '/sales') {
            if (parseFloat(d.precio_unitario) <= 0) return res.status(400).json({ error: "El precio unitario debe ser mayor a 0" });
            subtotal += qty * parseFloat(d.precio_unitario);
          } else {
            if (parseFloat(d.costo_unitario) <= 0) return res.status(400).json({ error: "El costo unitario debe ser mayor a 0" });
            subtotal += qty * parseFloat(d.costo_unitario);
          }
        }
        
        let igvRate = 0;
        if(formData.id_igv) {
           const igvRes = await pool.request().query(`SELECT porcentaje FROM Igv WHERE id_igv = ${formData.id_igv}`);
           igvRate = igvRes.recordset.length > 0 ? igvRes.recordset[0].porcentaje : 0;
        }
        const monto_igv = subtotal * igvRate;
        const total = subtotal + monto_igv;

        if (path === '/sales') {
          // Usar Procedimiento Almacenado sp_RegistrarVenta
          const vResult = await pool.request()
            .input('id_cliente', sql.Int, formData.id_cliente)
            .input('id_empleado', sql.Int, user_id)
            .input('id_metodo_pago', sql.Int, formData.id_metodo_pago)
            .input('subtotal', sql.Decimal(10, 2), subtotal)
            .input('monto_igv', sql.Decimal(10, 2), monto_igv)
            .input('total', sql.Decimal(10, 2), total)
            .execute('sp_RegistrarVenta');
          
          const newVentaId = vResult.recordset[0].id_venta;

          for (const d of details) {
            const prodSubtotal = parseInt(d.cantidad) * parseFloat(d.precio_unitario);
            const qDetail = `
              INSERT INTO Detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
              VALUES (${newVentaId}, ${d.id_producto}, ${d.cantidad}, ${d.precio_unitario}, ${prodSubtotal});
              UPDATE Inventario SET stock_actual = stock_actual - ${d.cantidad}, fecha_modificacion = GETDATE() WHERE id_producto = ${d.id_producto};
              INSERT INTO Movimientos_inventario (id_producto, id_detalle_venta, tipo_movimiento, cantidad, stock_anterior, stock_nuevo)
              SELECT ${d.id_producto}, SCOPE_IDENTITY(), 'VENTA', ${d.cantidad}, stock_actual + ${d.cantidad}, stock_actual FROM Inventario WHERE id_producto = ${d.id_producto};
            `;
            await pool.request().query(qDetail);
          }
        } else {
          // Usar Procedimiento Almacenado sp_RegistrarCompra
          const cResult = await pool.request()
            .input('id_proveedor', sql.Int, formData.id_proveedor)
            .input('id_empleado', sql.Int, user_id)
            .input('id_igv', sql.Int, formData.id_igv)
            .input('id_metodo_pago', sql.Int, formData.id_metodo_pago)
            .input('subtotal', sql.Decimal(10, 2), subtotal)
            .input('monto_igv', sql.Decimal(10, 2), monto_igv)
            .input('total', sql.Decimal(10, 2), total)
            .execute('sp_RegistrarCompra');

          const newCompraId = cResult.recordset[0].id_compra;

          for (const d of details) {
            const prodSubtotal = parseInt(d.cantidad) * parseFloat(d.costo_unitario);
            const qDetail = `
              INSERT INTO Detalle_compras (id_compra, id_producto, cantidad, costo_unitario, subtotal)
              VALUES (${newCompraId}, ${d.id_producto}, ${d.cantidad}, ${d.costo_unitario}, ${prodSubtotal});
              UPDATE Inventario SET stock_actual = stock_actual + ${d.cantidad}, fecha_modificacion = GETDATE() WHERE id_producto = ${d.id_producto};
              INSERT INTO Movimientos_inventario (id_producto, id_detalle_compra, tipo_movimiento, cantidad, stock_anterior, stock_nuevo)
              SELECT ${d.id_producto}, SCOPE_IDENTITY(), 'COMPRA', ${d.cantidad}, stock_actual - ${d.cantidad}, stock_actual FROM Inventario WHERE id_producto = ${d.id_producto};
            `;
            await pool.request().query(qDetail);
          }
        }
        return res.json({ success: true });

        break;
      default:
        return res.status(400).json({ error: "Ruta no soportada" });
    }
    
    await pool.request().query(query);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/deactivate', async (req, res) => {
  const { path, id } = req.body;
  try {
    const idStr = String(id);
    const numericId = parseInt(idStr.split('-').pop() || idStr);
    const pool = await poolPromise;
    let table = '';
    let idColumn = '';
    
    switch(path) {
      case '/products': 
        table = 'Productos'; 
        idColumn = 'id_producto'; 
        // Get current stock before deactivating
        const stockRes = await pool.request().query(`SELECT stock_actual FROM Inventario WHERE id_producto = ${numericId}`);
        const currentStock = stockRes.recordset.length > 0 ? stockRes.recordset[0].stock_actual : 0;
        
        if (currentStock > 0) {
          // Record adjustment movement for the "frozen" stock
          await pool.request().query(`
            INSERT INTO Movimientos_inventario (id_producto, tipo_movimiento, cantidad, stock_anterior, stock_nuevo)
            VALUES (${numericId}, 'AJUSTE POR DESACTIVACIÓN', ${currentStock}, ${currentStock}, 0);
            UPDATE Inventario SET stock_actual = 0, estado = 'INACTIVO', fecha_modificacion = GETDATE() WHERE id_producto = ${numericId};
          `);
        } else {
          await pool.request().query(`UPDATE Inventario SET estado = 'INACTIVO' WHERE id_producto = ${numericId}`);
        }
        break;
      case '/categories': table = 'Categoria'; idColumn = 'id_categoria'; break;
      case '/supplier-categories': table = 'Rubro_proveedor'; idColumn = 'id_rubro'; break;
      case '/suppliers': table = 'Proveedores'; idColumn = 'id_proveedor'; break;
      case '/customers': table = 'Clientes'; idColumn = 'id_cliente'; break;
      case '/customer-types': table = 'Tipo_cliente'; idColumn = 'id_tipo_cliente'; break;
      case '/employees':
        const empCheck = await pool.request().query(`SELECT usuario FROM Empleados WHERE id_empleado = ${numericId}`);
        if (empCheck.recordset.length > 0 && empCheck.recordset[0].usuario === 'admin') {
          return res.status(400).json({ error: "No se puede desactivar al administrador principal" });
        }
        table = 'Empleados'; idColumn = 'id_empleado'; 
        break;
      case '/sales':
        const ventaStatus = await pool.request().query(`SELECT estado FROM Ventas WHERE id_venta = ${numericId}`);
        if (ventaStatus.recordset.length === 0 || ventaStatus.recordset[0].estado.toUpperCase() !== 'ACTIVO') {
          return res.status(400).json({ error: "La venta ya está inactiva o no existe" });
        }
        await pool.request()
          .input('id_venta', sql.Int, numericId)
          .execute('sp_AnularVenta');
        return res.json({ success: true });

      case '/purchases':
        const compraStatus = await pool.request().query(`SELECT estado FROM Compras WHERE id_compra = ${numericId}`);
        if (compraStatus.recordset.length === 0 || compraStatus.recordset[0].estado.toUpperCase() !== 'ACTIVO') {
          return res.status(400).json({ error: "La compra ya está inactiva o no existe" });
        }
        await pool.request()
          .input('id_compra', sql.Int, numericId)
          .execute('sp_AnularCompra');
        return res.json({ success: true });

      default:
        return res.status(400).json({ error: "Ruta no soportada" });
    }
    
    if (table && idColumn) {
      await pool.request().query(`UPDATE ${table} SET estado = 'INACTIVO' WHERE ${idColumn} = ${numericId}`);
      res.json({ success: true });
    }
  } catch (err) {
    console.error("Error en /api/deactivate:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
