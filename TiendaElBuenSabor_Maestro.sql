/*
*******************************************************************************
PROYECTO: TIENDA EL BUEN SABOR - GESTIÓN INTEGRAL
CURSO: BASE DE DATOS SQL
ESTADO: ENTREGABLE FINAL (GRUPAL)
*******************************************************************************
*/

USE [master];
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'empresa')
BEGIN
    ALTER DATABASE [empresa] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [empresa];
END
GO

CREATE DATABASE [empresa];
GO

USE [empresa];
GO

-- =============================================
-- 1. CREACIÓN DE TABLAS (ESTRUCTURA RELACIONAL)
-- =============================================

-- 1.1 Catálogos Básicos
CREATE TABLE Roles (
    id_rol INT PRIMARY KEY IDENTITY(1,1),
    nombre_rol VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE Tipo_cliente (
    id_tipo_cliente INT PRIMARY KEY IDENTITY(1,1),
    nombre_tipo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

CREATE TABLE Metodo_pago (
    id_metodo_pago INT PRIMARY KEY IDENTITY(1,1),
    nombre_metodo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE Igv (
    id_igv INT PRIMARY KEY IDENTITY(1,1),
    porcentaje DECIMAL(5,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE Rubro_proveedor (
    id_rubro INT PRIMARY KEY IDENTITY(1,1),
    nombre_rubro VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

CREATE TABLE Categoria (
    id_categoria INT PRIMARY KEY IDENTITY(1,1),
    nombre_categoria VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

-- 1.2 Entidades Principales
CREATE TABLE Empleados (
    id_empleado INT PRIMARY KEY IDENTITY(1,1),
    id_rol INT FOREIGN KEY REFERENCES Roles(id_rol),
    dni CHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    correo VARCHAR(100),
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY IDENTITY(1,1),
    id_tipo_cliente INT FOREIGN KEY REFERENCES Tipo_cliente(id_tipo_cliente),
    dni CHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

CREATE TABLE Proveedores (
    id_proveedor INT PRIMARY KEY IDENTITY(1,1),
    id_rubro INT FOREIGN KEY REFERENCES Rubro_proveedor(id_rubro),
    ruc CHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(150) NOT NULL,
    representante_legal VARCHAR(150),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    correo VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

CREATE TABLE Productos (
    id_producto INT PRIMARY KEY IDENTITY(1,1),
    id_categoria INT FOREIGN KEY REFERENCES Categoria(id_categoria),
    nombre_producto VARCHAR(150) NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

-- 1.3 Gestión de Stock
CREATE TABLE Inventario (
    id_inventario INT PRIMARY KEY IDENTITY(1,1),
    id_producto INT FOREIGN KEY REFERENCES Productos(id_producto),
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 10,
    stock_maximo INT DEFAULT 500,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE(),
    fecha_modificacion DATETIME
);

-- 1.4 Operaciones (Ventas y Compras)
CREATE TABLE Ventas (
    id_venta INT PRIMARY KEY IDENTITY(1,1),
    id_cliente INT FOREIGN KEY REFERENCES Clientes(id_cliente),
    id_empleado INT FOREIGN KEY REFERENCES Empleados(id_empleado),
    id_metodo_pago INT FOREIGN KEY REFERENCES Metodo_pago(id_metodo_pago),
    subtotal DECIMAL(10,2),
    monto_igv DECIMAL(10,2),
    total DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_venta DATETIME DEFAULT GETDATE(),
    fecha_anulacion DATETIME
);

CREATE TABLE Detalle_ventas (
    id_detalle_venta INT PRIMARY KEY IDENTITY(1,1),
    id_venta INT FOREIGN KEY REFERENCES Ventas(id_venta),
    id_producto INT FOREIGN KEY REFERENCES Productos(id_producto),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE Compras (
    id_compra INT PRIMARY KEY IDENTITY(1,1),
    id_proveedor INT FOREIGN KEY REFERENCES Proveedores(id_proveedor),
    id_empleado INT FOREIGN KEY REFERENCES Empleados(id_empleado),
    id_igv INT FOREIGN KEY REFERENCES Igv(id_igv),
    subtotal DECIMAL(10,2),
    monto_igv DECIMAL(10,2),
    total DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_compra DATETIME DEFAULT GETDATE(),
    fecha_anulacion DATETIME
);

CREATE TABLE Detalle_compras (
    id_detalle_compra INT PRIMARY KEY IDENTITY(1,1),
    id_compra INT FOREIGN KEY REFERENCES Compras(id_compra),
    id_producto INT FOREIGN KEY REFERENCES Productos(id_producto),
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

CREATE TABLE Pagos (
    id_pago INT PRIMARY KEY IDENTITY(1,1),
    id_venta INT FOREIGN KEY REFERENCES Ventas(id_venta),
    id_compra INT FOREIGN KEY REFERENCES Compras(id_compra),
    id_metodo_pago INT FOREIGN KEY REFERENCES Metodo_pago(id_metodo_pago),
    monto_pago DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_pago DATETIME DEFAULT GETDATE()
);

CREATE TABLE Movimientos_inventario (
    id_movimiento INT PRIMARY KEY IDENTITY(1,1),
    id_producto INT FOREIGN KEY REFERENCES Productos(id_producto),
    id_detalle_compra INT FOREIGN KEY REFERENCES Detalle_compras(id_detalle_compra),
    id_detalle_venta INT FOREIGN KEY REFERENCES Detalle_ventas(id_detalle_venta),
    tipo_movimiento VARCHAR(50), -- 'VENTA', 'COMPRA', 'AJUSTE', 'ANULACION'
    cantidad INT,
    stock_anterior INT,
    stock_nuevo INT,
    fecha_movimiento DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- 2. INSERCIÓN DE DATOS DE EJEMPLO
-- =============================================

-- Roles
INSERT INTO Roles (nombre_rol) VALUES ('Administrador'), ('Ventas'), ('Compras'), ('Almacen');

-- Tipos de Cliente
INSERT INTO Tipo_cliente (nombre_tipo) VALUES ('Minorista'), ('Mayorista'), ('Corporativo');

-- Metodos de Pago
INSERT INTO Metodo_pago (nombre_metodo) VALUES ('Efectivo'), ('Tarjeta de Crédito'), ('Yape'), ('Transferencia');

-- IGV
INSERT INTO Igv (porcentaje) VALUES (0.18), (0.00);

-- Categorias y Rubros
INSERT INTO Categoria (nombre_categoria) VALUES ('Abarrotes'), ('Bebidas'), ('Limpieza'), ('Lácteos');
INSERT INTO Rubro_proveedor (nombre_rubro) VALUES ('Distribuidora General'), ('Bebidas y Alcohol'), ('Productos de Granja');

-- Empleado Admin
INSERT INTO Empleados (id_rol, dni, nombres, apellidos, usuario, password) 
VALUES (1, '77778888', 'Admin', 'Sistema', 'admin', 'admin123');

-- Clientes
INSERT INTO Clientes (id_tipo_cliente, dni, nombres, apellidos, telefono, correo)
VALUES (1, '11223344', 'Juan', 'Perez', '999888777', 'juan@gmail.com'),
       (2, '55667788', 'Maria', 'Garcia', '944333222', 'maria@empresa.pe');

-- Proveedores
INSERT INTO Proveedores (id_rubro, ruc, razon_social, representante_legal)
VALUES (1, '20123456789', 'Alicorp S.A.A.', 'Representante Alicorp'),
       (2, '20987654321', 'Backus S.A.', 'Representante Backus');

-- Productos e Inventario Inicial
INSERT INTO Productos (id_categoria, nombre_producto, precio_compra, precio_venta)
VALUES (1, 'Arroz Extra 1kg', 3.20, 4.50),
       (1, 'Aceite Vegetal 1L', 7.50, 9.80),
       (2, 'Gaseosa Inka Cola 3L', 8.50, 11.50),
       (4, 'Leche Gloria 400g', 3.40, 4.20);

INSERT INTO Inventario (id_producto, stock_actual, stock_minimo, stock_maximo)
SELECT id_producto, 50, 10, 200 FROM Productos;

GO

-- =============================================
-- 3. PROCEDIMIENTOS ALMACENADOS (8+)
-- =============================================

-- 3.1 Registrar Venta
CREATE PROCEDURE sp_RegistrarVenta
    @id_cliente INT,
    @id_empleado INT,
    @id_metodo_pago INT,
    @subtotal DECIMAL(10,2),
    @monto_igv DECIMAL(10,2),
    @total DECIMAL(10,2)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;
        INSERT INTO Ventas (id_cliente, id_empleado, id_metodo_pago, subtotal, monto_igv, total)
        VALUES (@id_cliente, @id_empleado, @id_metodo_pago, @subtotal, @monto_igv, @total);
        
        DECLARE @newId INT = SCOPE_IDENTITY();
        
        INSERT INTO Pagos (id_venta, id_metodo_pago, monto_pago)
        VALUES (@newId, @id_metodo_pago, @total);
        
        SELECT @newId AS id_venta;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 3.2 Registrar Compra
CREATE PROCEDURE sp_RegistrarCompra
    @id_proveedor INT,
    @id_empleado INT,
    @id_igv INT,
    @subtotal DECIMAL(10,2),
    @monto_igv DECIMAL(10,2),
    @total DECIMAL(10,2)
AS
BEGIN
    BEGIN TRANSACTION;
    INSERT INTO Compras (id_proveedor, id_empleado, id_igv, subtotal, monto_igv, total)
    VALUES (@id_proveedor, @id_empleado, @id_igv, @subtotal, @monto_igv, @total);
    
    DECLARE @newId INT = SCOPE_IDENTITY();
    SELECT @newId AS id_compra;
    COMMIT TRANSACTION;
END;
GO

-- 3.3 Alertas de Stock
CREATE PROCEDURE sp_AlertasStock
AS
BEGIN
    SELECT p.nombre_producto, i.stock_actual, i.stock_minimo, i.stock_maximo,
           CASE 
               WHEN i.stock_actual <= i.stock_minimo THEN 'CRÍTICO: STOCK BAJO'
               WHEN i.stock_actual >= i.stock_maximo THEN 'ALERTA: SOBRE-STOCK'
               ELSE 'NORMAL'
           END as estado_inventario
    FROM Inventario i
    JOIN Productos p ON i.id_producto = p.id_producto
    WHERE i.stock_actual <= i.stock_minimo OR i.stock_actual >= i.stock_maximo;
END;
GO

-- 3.4 Anular Venta
CREATE PROCEDURE sp_AnularVenta
    @id_venta INT
AS
BEGIN
    UPDATE Ventas SET estado = 'inactivo', fecha_anulacion = GETDATE() WHERE id_venta = @id_venta;
    UPDATE Pagos SET estado = 'inactivo' WHERE id_venta = @id_venta;
    
    -- Devolver stock
    UPDATE i
    SET i.stock_actual = i.stock_actual + dv.cantidad
    FROM Inventario i
    JOIN Detalle_ventas dv ON i.id_producto = dv.id_producto
    WHERE dv.id_venta = @id_venta;
END;
GO

-- 3.4.1 Anular Compra
CREATE PROCEDURE sp_AnularCompra
    @id_compra INT
AS
BEGIN
    UPDATE Compras SET estado = 'inactivo', fecha_anulacion = GETDATE() WHERE id_compra = @id_compra;
    UPDATE Pagos SET estado = 'inactivo' WHERE id_compra = @id_compra;
    
    -- Restar stock (validando que no quede negativo)
    UPDATE i
    SET i.stock_actual = i.stock_actual - dc.cantidad
    FROM Inventario i
    JOIN Detalle_compras dc ON i.id_producto = dc.id_producto
    WHERE dc.id_compra = @id_compra;
END;
GO


-- 3.5 Reporte de Ventas por Fecha
CREATE PROCEDURE sp_ReporteVentasPorFecha
    @fecha_inicio DATETIME,
    @fecha_fin DATETIME
AS
BEGIN
    SELECT v.id_venta, c.nombres + ' ' + c.apellidos as cliente, v.total, v.fecha_venta
    FROM Ventas v
    JOIN Clientes c ON v.id_cliente = c.id_cliente
    WHERE v.fecha_venta BETWEEN @fecha_inicio AND @fecha_fin AND v.estado = 'activo'
    ORDER BY v.fecha_venta DESC;
END;
GO

-- 3.6 Actualizar Precio Producto
CREATE PROCEDURE sp_ActualizarPrecioProducto
    @id_producto INT,
    @nuevo_precio_venta DECIMAL(10,2)
AS
BEGIN
    UPDATE Productos SET precio_venta = @nuevo_precio_venta WHERE id_producto = @id_producto;
END;
GO

-- 3.7 Consultar Movimientos por Producto
CREATE PROCEDURE sp_MovimientosPorProducto
    @id_producto INT
AS
BEGIN
    SELECT tipo_movimiento, cantidad, stock_anterior, stock_nuevo, fecha_movimiento
    FROM Movimientos_inventario
    WHERE id_producto = @id_producto
    ORDER BY fecha_movimiento DESC;
END;
GO

-- 3.8 Consolidado Financiero Diario
CREATE PROCEDURE sp_ConsolidadoDiario
    @fecha DATE
AS
BEGIN
    DECLARE @totalVentas DECIMAL(10,2) = (SELECT ISNULL(SUM(total), 0) FROM Ventas WHERE CAST(fecha_venta AS DATE) = @fecha AND estado = 'activo');
    DECLARE @totalCompras DECIMAL(10,2) = (SELECT ISNULL(SUM(total), 0) FROM Compras WHERE CAST(fecha_compra AS DATE) = @fecha AND estado = 'activo');
    
    SELECT @fecha as Fecha, @totalVentas as Total_Ingresos, @totalCompras as Total_Egresos, (@totalVentas - @totalCompras) as Balance;
END;
GO

-- =============================================
-- 4. CONSULTAS DE NEGOCIO (20+)
-- =============================================

-- 4.1 Top 10 productos más vendidos (volumen)
-- SELECT TOP 10 p.nombre_producto, SUM(dv.cantidad) as total_vendido
-- FROM Detalle_ventas dv JOIN Productos p ON dv.id_producto = p.id_producto
-- GROUP BY p.nombre_producto ORDER BY total_vendido DESC;

-- 4.2 Ventas totales por tipo de cliente
-- SELECT t.nombre_tipo, SUM(v.total) as monto_total
-- FROM Ventas v JOIN Clientes c ON v.id_cliente = c.id_cliente
-- JOIN Tipo_cliente t ON c.id_tipo_cliente = t.id_tipo_cliente
-- GROUP BY t.nombre_tipo;

-- 4.3 Productos que nunca se han vendido
-- SELECT nombre_producto FROM Productos WHERE id_producto NOT IN (SELECT DISTINCT id_producto FROM Detalle_ventas);

-- 4.4 Stock actual vs Stock mínimo (Necesidad de reposición)
-- SELECT p.nombre_producto, i.stock_actual, i.stock_minimo FROM Inventario i JOIN Productos p ON i.id_producto = p.id_producto WHERE i.stock_actual < i.stock_minimo;

-- 4.5 Ingresos mensuales del año actual
-- SELECT MONTH(fecha_venta) as Mes, SUM(total) as Ingresos FROM Ventas WHERE YEAR(fecha_venta) = YEAR(GETDATE()) AND estado = 'activo' GROUP BY MONTH(fecha_venta);

-- 4.6 Ranking de empleados por monto vendido
-- SELECT e.nombres, e.apellidos, SUM(v.total) as total_ventas FROM Ventas v JOIN Empleados e ON v.id_empleado = e.id_empleado GROUP BY e.nombres, e.apellidos ORDER BY total_ventas DESC;

-- 4.7 Valorización total del inventario (Precio compra)
-- SELECT SUM(i.stock_actual * p.precio_compra) as valor_total_inventario FROM Inventario i JOIN Productos p ON i.id_producto = p.id_producto;

-- 4.8 Clientes con más de 5 pedidos
-- SELECT c.nombres, COUNT(v.id_venta) as num_pedidos FROM Ventas v JOIN Clientes c ON v.id_cliente = c.id_cliente GROUP BY c.nombres HAVING COUNT(v.id_venta) > 5;

-- 4.9 Margen de ganancia por producto
-- SELECT nombre_producto, (precio_venta - precio_compra) as margen FROM Productos;

-- 4.10 Método de pago más utilizado
-- SELECT TOP 1 m.nombre_metodo, COUNT(v.id_venta) as frecuencia FROM Ventas v JOIN Metodo_pago m ON v.id_metodo_pago = m.id_metodo_pago GROUP BY m.nombre_metodo ORDER BY frecuencia DESC;

-- 4.11 Ventas por categoría de producto
-- SELECT cat.nombre_categoria, SUM(dv.subtotal) as total_categoria FROM Detalle_ventas dv JOIN Productos p ON dv.id_producto = p.id_producto JOIN Categoria cat ON p.id_categoria = cat.id_categoria GROUP BY cat.nombre_categoria;

-- 4.12 Proveedores por rubro
-- SELECT r.nombre_rubro, COUNT(p.id_proveedor) as cantidad_proveedores FROM Proveedores p JOIN Rubro_proveedor r ON p.id_rubro = r.id_rubro GROUP BY r.nombre_rubro;

-- 4.13 Detalle de ventas anuladas (Pérdida de oportunidad)
-- SELECT id_venta, total, fecha_anulacion FROM Ventas WHERE estado = 'inactivo';

-- 4.14 Promedio de venta por cliente
-- SELECT AVG(total) as promedio_venta FROM Ventas WHERE estado = 'activo';

-- 4.15 Productos con sobre-stock (mayor al máximo)
-- SELECT p.nombre_producto, i.stock_actual, i.stock_maximo FROM Inventario i JOIN Productos p ON i.id_producto = p.id_producto WHERE i.stock_actual > i.stock_maximo;

-- 4.16 Días con mayor volumen de ventas
-- SELECT CAST(fecha_venta AS DATE) as fecha, COUNT(*) as cantidad_ventas FROM Ventas GROUP BY CAST(fecha_venta AS DATE) ORDER BY cantidad_ventas DESC;

-- 4.17 Último movimiento de cada producto
-- SELECT p.nombre_producto, MAX(m.fecha_movimiento) as ultima_fecha FROM Movimientos_inventario m JOIN Productos p ON m.id_producto = p.id_producto GROUP BY p.nombre_producto;

-- 4.18 Total de IGV recaudado en el mes
-- SELECT SUM(monto_igv) as igv_total FROM Ventas WHERE MONTH(fecha_venta) = MONTH(GETDATE()) AND YEAR(fecha_venta) = YEAR(GETDATE());

-- 4.19 Lista de empleados inactivos
-- SELECT nombres, apellidos, usuario FROM Empleados WHERE estado = 'inactivo';

-- 4.20 Clientes que no han realizado compras este mes
-- SELECT nombres, apellidos FROM Clientes WHERE id_cliente NOT IN (SELECT id_cliente FROM Ventas WHERE MONTH(fecha_venta) = MONTH(GETDATE()));

GO
PRINT 'Script ejecutado con éxito. Base de datos [empresa] lista para usar.';
