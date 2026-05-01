# Auditoría de Cumplimiento de Requisitos - Grupo "Tienda El Buen Sabor" 📋

Este documento certifica el cumplimiento de todas las directrices establecidas para el proyecto final del curso de Base de Datos SQL.

## 1. Resumen de Cumplimiento

| Requisito | Estado | Ubicación / Evidencia |
| :--- | :---: | :--- |
| **Uso de 4+ tablas relacionales** | ✅ Cumplido | Se utilizan **17 tablas** correctamente enlazadas (PK/FK). |
| **20+ Consultas SQL de negocio** | ✅ Cumplido | Definidas en el script maestro (Sección 4). |
| **8+ Procedimientos almacenados** | ✅ Cumplido | Definidos en el script maestro (Sección 3). |
| **Inserción de datos de ejemplo** | ✅ Cumplido | Datos realistas incluidos en el script y `seed.js`. |
| **Tablas Obligatorias** | ✅ Cumplido | Clientes, Productos, Ventas, Pagos presentes. |
| **Integración con Aplicación (Extra)** | ✅ Cumplido | Sistema completo con Front-end (React) y Back-end (Node). |

---

## 2. Detalle de Tablas (17)
1.  `Roles`
2.  `Tipo_cliente`
3.  `Metodo_pago`
4.  `Igv`
5.  `Rubro_proveedor`
6.  `Categoria`
7.  `Empleados`
8.  `Clientes`
9.  `Proveedores`
10. `Productos`
11. `Inventario`
12. `Ventas`
13. `Detalle_ventas`
14. `Compras`
15. `Detalle_compras`
16. `Pagos`
17. `Movimientos_inventario`

---

## 3. Listado de Procedimientos Almacenados (8)
*   `sp_RegistrarVenta`: Gestiona el registro de cabecera de venta y pago.
*   `sp_RegistrarCompra`: Gestiona el registro de cabecera de compra.
*   `sp_AlertasStock`: Detecta productos con niveles críticos o excesivos.
*   `sp_AnularVenta`: Revierte una venta y devuelve el stock al inventario.
*   `sp_ReporteVentasPorFecha`: Filtra transacciones por rangos temporales.
*   `sp_ActualizarPrecioProducto`: Permite el mantenimiento ágil de precios.
*   `sp_MovimientosPorProducto`: Historial detallado de entradas y salidas.
*   `sp_ConsolidadoDiario`: Resumen financiero (Ingresos vs Egresos) por día.

---

## 4. Consultas de Negocio Destacadas
El script incluye 20 consultas diseñadas para la toma de decisiones, entre ellas:
*   **KPI de Rentabilidad:** Margen de ganancia por producto.
*   **Análisis de Inventario:** Valorización total del stock y productos sin rotación.
*   **Comportamiento de Clientes:** Ranking de clientes frecuentes y tipos de cliente más rentables.
*   **Eficiencia Operativa:** Ranking de empleados por volumen de ventas.
*   **Finanzas:** Recaudación de IGV y conciliación de métodos de pago.

---

## 5. Valoración Adicional (Puntos Extra)
*   **Frontend Interactivo:** Se entrega una SPA (Single Page Application) moderna.
*   **Arquitectura Profesional:** Uso de transacciones SQL para asegurar la integridad de los datos.
*   **Seguridad:** Manejo de estados (Activo/Inactivo) para borrado lógico y protección de datos sensibles.
