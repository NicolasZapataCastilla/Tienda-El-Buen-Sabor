
export type Role = 'ADMIN' | 'PURCHASE_USER' | 'SALES_USER' | 'INVENTORY_USER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  employee_id: number;
}

export const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', name: 'System Admin', role: 'ADMIN', employee_id: 1 }
];

export interface ModuleAccess {
  path: string;
  name: string;
  icon: string;
  readOnly?: boolean;
}

export const ROLE_ACCESS: Record<Role, ModuleAccess[]> = {
  ADMIN: [
    { path: '/employees', name: 'Empleados', icon: 'users' },
    { path: '/supplier-categories', name: 'Rubros de Proveedor', icon: 'tag' },
    { path: '/suppliers', name: 'Proveedores', icon: 'truck' },
    { path: '/purchases', name: 'Compras', icon: 'shopping-cart' },
    { path: '/customer-types', name: 'Tipos de Cliente', icon: 'users' },
    { path: '/customers', name: 'Clientes', icon: 'user-check' },
    { path: '/sales', name: 'Ventas', icon: 'dollar-sign' },
    { path: '/inventory', name: 'Inventario', icon: 'clipboard', readOnly: true },
    { path: '/movements', name: 'Movimientos', icon: 'activity', readOnly: true },
    { path: '/categories', name: 'Categorías', icon: 'list' },
    { path: '/products', name: 'Productos', icon: 'package' },
    { path: '/consolidated', name: 'Consolidado', icon: 'bar-chart-2', readOnly: true },
    { path: '/payments', name: 'Historial de Pagos', icon: 'credit-card', readOnly: true },
    { path: '/reports', name: 'Reportes Power BI', icon: 'pie-chart', readOnly: true },
    { path: '/sql-lab', name: 'Laboratorio SQL', icon: 'code' },
  ],
  PURCHASE_USER: [
    { path: '/supplier-categories', name: 'Rubros de Proveedor', icon: 'tag' },
    { path: '/suppliers', name: 'Proveedores', icon: 'truck' },
    { path: '/purchases', name: 'Compras', icon: 'shopping-cart' },
  ],
  SALES_USER: [
    { path: '/customer-types', name: 'Tipos de Cliente', icon: 'users' },
    { path: '/customers', name: 'Clientes', icon: 'user-check' },
    { path: '/sales', name: 'Ventas', icon: 'dollar-sign' },
  ],
  INVENTORY_USER: [
    { path: '/inventory', name: 'Inventario', icon: 'clipboard', readOnly: true },
    { path: '/movements', name: 'Movimientos', icon: 'activity', readOnly: true },
    { path: '/purchases', name: 'Compras (Solo lectura)', icon: 'shopping-cart', readOnly: true },
    { path: '/sales', name: 'Ventas (Solo lectura)', icon: 'dollar-sign', readOnly: true },
    { path: '/categories', name: 'Categorías', icon: 'list' },
    { path: '/products', name: 'Productos', icon: 'package' },
  ]
};


