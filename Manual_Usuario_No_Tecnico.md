# Manual de Usuario - Tienda El Buen Sabor 🏪

Este documento explica de manera sencilla cómo funciona el sistema de gestión para la **Tienda El Buen Sabor**, las herramientas utilizadas y cómo ponerlo en marcha.

## 1. ¿Qué es este sistema?
Es una aplicación diseñada para modernizar la gestión de una bodega o tienda local. Permite registrar ventas, compras, controlar el inventario de productos y gestionar clientes y proveedores, reemplazando las hojas de cálculo tradicionales por una base de datos segura y organizada.

---

## 2. Estructura del Proyecto (¿Cómo están las carpetas?)
El proyecto se divide en dos partes principales que se comunican entre sí:

*   **Carpeta `src` (Front-end):** Es la parte visual que el usuario ve en su navegador (botones, tablas, formularios). Está construida con **React**.
*   **Carpeta `server` (Back-end):** Es el "cerebro" del sistema. Se encarga de procesar los datos y guardarlos en la base de datos. Está construido con **Node.js**.
*   **Base de Datos (SQL Server):** Es donde se almacena toda la información de forma permanente (ventas, stock, precios).

---

## 3. Tecnologías Utilizadas (Stack)
Hemos elegido herramientas modernas y profesionales para este proyecto:
1.  **SQL Server 2022:** Para el almacenamiento robusto de datos relacionales.
2.  **Node.js (Express):** Para crear el servidor que conecta la web con la base de datos.
3.  **React (Vite):** Para una interfaz de usuario rápida, fluida y estética.
4.  **TypeScript:** Para asegurar que el código sea de alta calidad y evitar errores comunes.
5.  **CSS Moderno:** Para un diseño profesional con modo oscuro y animaciones suaves.

---

## 4. Guía de Módulos
El sistema cuenta con los siguientes módulos:

*   **Dashboard:** Resumen visual de ingresos, egresos y alertas de stock.
*   **Ventas:** Registro de ventas diarias seleccionando clientes y productos. El stock se descuenta automáticamente.
*   **Compras:** Registro de abastecimiento con proveedores. El stock se suma automáticamente.
*   **Inventario:** Lista de productos con alertas visuales (rojo si el stock es bajo).
*   **Mantenimiento:** Gestión de Clientes, Proveedores, Empleados y Categorías.

---

## 5. Cómo inicializar el proyecto (Paso a Paso)

### Requisitos Previos:
1.  Tener instalado **Node.js**.
2.  Tener instalado **SQL Server** y que la base de datos `empresa` esté creada (ejecutando el script `TiendaElBuenSabor_Maestro.sql`).

### Pasos para el arranque:

1.  **Abrir una terminal** en la carpeta del proyecto.
2.  **Instalar dependencias del servidor:**
    ```bash
    cd server
    npm install
    ```
3.  **Instalar dependencias de la web:**
    ```bash
    cd ..
    npm install
    ```
4.  **Arrancar el servidor (Back-end):**
    ```bash
    cd server
    node index.js
    ```
5.  **Arrancar la aplicación web (Front-end):**
    Abra otra terminal y ejecute:
    ```bash
    npm run dev
    ```
6.  **Acceder al sistema:**
    Abra su navegador en la dirección que indique la terminal (usualmente `http://localhost:5173`).
    *   **Usuario:** `admin`
    *   **Contraseña:** `admin123`

---

## 6. Seguridad del Proyecto
*   **Variables de Entorno:** Se utiliza un archivo `.env` para ocultar las contraseñas de la base de datos.
*   **Validaciones:** El sistema no permite ventas sin stock ni compras con datos incompletos.
*   **Roles:** Solo el Administrador tiene acceso a todos los módulos.
