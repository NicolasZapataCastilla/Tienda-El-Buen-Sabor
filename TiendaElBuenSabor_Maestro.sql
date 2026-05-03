/*
*******************************************************************************
PROYECTO: TIENDA EL BUEN SABOR - GESTIÓN INTEGRAL
CURSO: BASE DE DATOS SQL
ESTADO: ENTREGABLE FINAL (LIMPIO)
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
    fecha_pago DATETIME DEFAULT GETDATE(),
    fecha_anulacion DATETIME
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
-- 2. INSERCIÓN DE DATOS INICIALES (MÍNIMOS)
-- =============================================

-- Roles
INSERT INTO Roles (nombre_rol) VALUES ('Administrador'), ('Ventas'), ('Compras'), ('Almacen');

-- Metodos de Pago
INSERT INTO Metodo_pago (nombre_metodo) VALUES ('Efectivo'), ('Tarjeta Débito'), ('Tarjeta Crédito'), ('Yape/Plin'), ('Transferencia');

-- IGV
INSERT INTO Igv (porcentaje) VALUES (0.18), (0.00);

-- Empleado Admin
INSERT INTO Empleados (id_rol, dni, nombres, apellidos, usuario, password) 
VALUES (1, '77778888', 'Admin', 'Sistema', 'admin', 'admin123');

GO

-- =============================================
-- 3. PROCEDIMIENTOS ALMACENADOS
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
        -- Validación de estado activo
        IF NOT EXISTS (SELECT 1 FROM Clientes WHERE id_cliente = @id_cliente AND estado = 'ACTIVO')
        BEGIN
            RAISERROR('El cliente seleccionado no está activo o no existe.', 16, 1);
            RETURN;
        END

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
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 3.2 Registrar Compra
CREATE PROCEDURE sp_RegistrarCompra
    @id_proveedor INT,
    @id_empleado INT,
    @id_igv INT,
    @id_metodo_pago INT,
    @subtotal DECIMAL(10,2),
    @monto_igv DECIMAL(10,2),
    @total DECIMAL(10,2)
AS
BEGIN
    BEGIN TRY
        -- Validación de estado activo
        IF NOT EXISTS (SELECT 1 FROM Proveedores WHERE id_proveedor = @id_proveedor AND estado = 'ACTIVO')
        BEGIN
            RAISERROR('El proveedor seleccionado no está activo o no existe.', 16, 1);
            RETURN;
        END

        BEGIN TRANSACTION;
        INSERT INTO Compras (id_proveedor, id_empleado, id_igv, subtotal, monto_igv, total)
        VALUES (@id_proveedor, @id_empleado, @id_igv, @subtotal, @monto_igv, @total);
        
        DECLARE @newId INT = SCOPE_IDENTITY();
        
        INSERT INTO Pagos (id_compra, id_metodo_pago, monto_pago)
        VALUES (@newId, @id_metodo_pago, @total);
        
        SELECT @newId AS id_compra;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
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
    UPDATE Pagos SET estado = 'inactivo', fecha_anulacion = GETDATE() WHERE id_venta = @id_venta;
    
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
    UPDATE Pagos SET estado = 'inactivo', fecha_anulacion = GETDATE() WHERE id_compra = @id_compra;
    
    -- Restar stock
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

PRINT 'Script maestro actualizado. Base de datos [empresa] lista para usar.';
