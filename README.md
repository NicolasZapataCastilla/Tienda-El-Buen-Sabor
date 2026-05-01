# Tienda El Buen Sabor - Sistema de Gestión 🏪

Este proyecto es un sistema integral de gestión para una bodega local, desarrollado como proyecto grupal para el curso de Base de Datos SQL.

## 🚀 Características
- Gestión de Ventas y Compras con actualización de stock en tiempo real.
- Control de Inventario con alertas de stock bajo/máximo.
- Gestión de Clientes, Proveedores y Empleados.
- Dashboard interactivo con indicadores de negocio (KPIs).
- Base de datos robusta con más de 20 consultas y 8 procedimientos almacenados.

## 🛠️ Stack Tecnológico
- **Frontend:** React + Vite + Tailwind CSS / Vanilla CSS.
- **Backend:** Node.js + Express.
- **Base de Datos:** Microsoft SQL Server 2022.

## 📁 Estructura del Proyecto
- `/src`: Código fuente de la aplicación web (React).
- `/server`: API y lógica de negocio (Node.js).
- `TiendaElBuenSabor_Maestro.sql`: Script maestro de base de datos.
- `Manual_Usuario_No_Tecnico.md`: Guía para usuarios finales.
- `Auditoria_Cumplimiento_Grupal.md`: Documento de cumplimiento académico.

## ⚙️ Configuración y Ejecución

### 1. Requisitos
- Node.js v16+
- Microsoft SQL Server 2022
- Git

### 2. Instalación Local
1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   cd server && npm install
   ```
3. Configura la base de datos:
   - Ejecuta el script `TiendaElBuenSabor_Maestro.sql` en SQL Server Management Studio para crear las tablas y datos iniciales.

4. Variables de entorno:
   - Crea un archivo `.env` en la carpeta `/server` con los datos de tu conexión local (Server, Database, etc.).

### 3. Ejecución
Para iniciar el sistema, abre dos terminales:
- **Terminal 1 (Backend):** `cd server && node index.js`
- **Terminal 2 (Frontend):** `npm run dev`

Accede a la aplicación en `http://localhost:5173` con el usuario `admin` y contraseña `admin123`.

---
*Este proyecto fue desarrollado para fines educativos como parte del curso de Base de Datos SQL.*