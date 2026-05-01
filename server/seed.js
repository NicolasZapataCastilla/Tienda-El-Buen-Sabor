const { poolPromise } = require('./db');

async function seed() {
  try {
    const pool = await poolPromise;
    console.log("Conectado. Insertando datos por defecto...");

    const query = `
      -- Roles
      IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'Administrador')
      BEGIN
        INSERT INTO Roles (nombre_rol, estado) VALUES ('Administrador', 'activo');
        INSERT INTO Roles (nombre_rol, estado) VALUES ('Compras', 'activo');
        INSERT INTO Roles (nombre_rol, estado) VALUES ('Ventas', 'activo');
        INSERT INTO Roles (nombre_rol, estado) VALUES ('Almacen', 'activo');
      END

      -- Tipos de Cliente
      IF NOT EXISTS (SELECT 1 FROM Tipo_cliente WHERE nombre_tipo = 'Minorista')
      BEGIN
        INSERT INTO Tipo_cliente (nombre_tipo, estado) VALUES ('Minorista', 'activo');
        INSERT INTO Tipo_cliente (nombre_tipo, estado) VALUES ('Mayorista', 'activo');
      END

      -- Metodos de Pago
      IF NOT EXISTS (SELECT 1 FROM Metodo_pago WHERE nombre_metodo = 'Efectivo')
      BEGIN
        INSERT INTO Metodo_pago (nombre_metodo, estado) VALUES ('Efectivo', 'activo');
        INSERT INTO Metodo_pago (nombre_metodo, estado) VALUES ('Tarjeta de Crédito', 'activo');
        INSERT INTO Metodo_pago (nombre_metodo, estado) VALUES ('Transferencia', 'activo');
        INSERT INTO Metodo_pago (nombre_metodo, estado) VALUES ('Yape/Plin', 'activo');
      END

      -- IGV
      IF NOT EXISTS (SELECT 1 FROM Igv WHERE porcentaje = 0.18)
      BEGIN
        INSERT INTO Igv (porcentaje, estado) VALUES (0.18, 'activo');
        INSERT INTO Igv (porcentaje, estado) VALUES (0.00, 'activo');
      END
      
      -- Empleado Administrador por defecto
      IF NOT EXISTS (SELECT 1 FROM Empleados WHERE usuario = 'admin')
      BEGIN
        DECLARE @adminRolId INT = (SELECT TOP 1 id_rol FROM Roles WHERE nombre_rol = 'Administrador');
        IF @adminRolId IS NOT NULL
        BEGIN
            INSERT INTO Empleados (id_rol, dni, nombres, apellidos, telefono, direccion, correo, usuario, password, estado)
            VALUES (@adminRolId, '00000000', 'Administrador', 'Principal', '000', '-', 'admin@empresa.com', 'admin', 'admin123', 'activo');
        END
      END
    `;

    await pool.request().query(query);
    console.log("¡Datos insertados correctamente en SQL Server!");
    process.exit(0);
  } catch (err) {
    console.error("Error insertando datos:", err);
    process.exit(1);
  }
}

seed();
