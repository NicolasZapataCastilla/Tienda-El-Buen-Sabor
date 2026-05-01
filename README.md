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

## ⚙️ Configuración y Despliegue

### 1. Requisitos
- Node.js v16+
- SQL Server 2022
- Git

### 2. Instalación Local
1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```
2. Instala dependencias:
   ```bash
   npm install
   cd server && npm install
   ```
3. Configura la base de datos:
   - Ejecuta `TiendaElBuenSabor_Maestro.sql` en tu SQL Server Management Studio.
4. Configura variables de entorno:
   - Crea un archivo `.env` dentro de la carpeta `/server` siguiendo el ejemplo:
     ```env
     DB_SERVER=localhost
     DB_DATABASE=empresa
     DB_DRIVER=ODBC Driver 18 for SQL Server
     PORT=3000
     ```

### 3. Ejecución
- Inicia el servidor: `cd server && node index.js`
- Inicia el frontend: `npm run dev`

### 4. Despliegue en GitHub
- El proyecto ya cuenta con un archivo `.gitignore` profesional para evitar subir información sensible como `node_modules` o archivos `.env`.
- **Importante:** Al subir a GitHub, asegúrate de que el `.env` NO esté incluido.

### 5. Hosting (Opciones Recomendadas)
- **Frontend:** [Vercel](https://vercel.com/) o [Netlify](https://www.netlify.com/). Conecta tu repo y usa el comando `npm run build`.
- **Backend:** [Render](https://render.com/) o [Railway](https://railway.app/). Recuerda configurar las Variables de Entorno en el panel de control del hosting.
- **Base de Datos:** Para SQL Server gratuito en la nube, se recomienda [Azure for Students](https://azure.microsoft.com/en-us/free/students/) o usar un túnel como **Ngrok** para pruebas locales.

## 🛡️ Seguridad
Este proyecto implementa:
- **Borrado Lógico:** Las entidades no se eliminan físicamente, se marcan como inactivas.
- **Transacciones SQL:** Para asegurar que si una venta falla, el stock no se descuente erróneamente.
- **Protección de Credenciales:** Uso de archivos de entorno `.env`.