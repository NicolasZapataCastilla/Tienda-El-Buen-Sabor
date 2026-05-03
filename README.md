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
- `/Informacion_Usuario`: Manuales y documentación del proyecto.
- `TiendaElBuenSabor_Maestro.sql`: Script maestro de base de datos.

## ⚙️ Configuración y Ejecución

### 1. Requisitos
- Node.js v16+
- Microsoft SQL Server 2022 (Express o Developer)
- Git

### 2. Instalación Local
1. Instala las dependencias necesarias:
   ```bash
   # En la raíz
   npm install
   # En la carpeta server
   cd server && npm install
   ```
2. Configura las variables de entorno:
   - Crea un archivo `.env` dentro de la carpeta `/server` con el siguiente formato:
     ```env
     DB_USER=tu_usuario_sql
     DB_PASSWORD=tu_password_sql
     DB_SERVER=localhost
     DB_DATABASE=master
     DB_PORT=1433
     ```
   - **IMPORTANTE:** Para la configuración inicial de la base de datos, asegúrate de que `DB_DATABASE` sea `master`. Una vez creada la base de datos, puedes cambiarlo a `empresa`.

3. Configura la base de datos:
   - Tienes dos opciones:
     - **Opción A (Recomendada):** Ejecuta `npm run setup-db` dentro de la carpeta `/server`. Esto creará automáticamente la base de datos `empresa` y todas sus tablas.
     - **Opción B:** Ejecuta manualmente el script `TiendaElBuenSabor_Maestro.sql` en SQL Server Management Studio (SSMS).

### 3. Ejecución
Para iniciar el sistema:
1. **Inicia el Backend:** `cd server && npm start`
2. **Inicia el Frontend:** `npm run dev` (desde la raíz del proyecto)

Accede a la aplicación en `http://localhost:5173` con el usuario `admin` y contraseña `admin123`.

---
*Este proyecto fue desarrollado para fines educativos como parte del curso de Base de Datos SQL.*