# Guía de Migración: Sistema Basado en Permisos

## 📋 Resumen de Cambios

Este documento describe la migración del sistema de autenticación y autorización de un modelo basado en roles a uno completamente basado en permisos.

### 🔄 Cambios Principales

1. **Eliminación de privilegios especiales por rol**: Ya no hay verificaciones especiales para el rol "admin"
2. **Sistema de permisos granular**: Todo el acceso se controla mediante permisos específicos
3. **Roles en base de datos**: Los roles ahora se almacenan en la base de datos con sus permisos predeterminados
4. **Flexibilidad mejorada**: Se pueden crear roles personalizados fácilmente

## 🚀 Pasos para la Migración

### 1. Ejecutar Seed de Permisos (si no se ha hecho)
```bash
npm run seed:permissions
```

### 2. Ejecutar Seed de Roles
```bash
npm run seed:roles
```

### 3. Ejecutar Migración de Usuarios
```bash
npm run migrate:permissions
```

## 📊 Roles del Sistema

### 🔧 Roles Predefinidos

1. **admin** (Prioridad: 100)
   - Acceso completo a todas las funcionalidades
   - Permisos: Todos los permisos disponibles en el sistema

2. **veterinario** (Prioridad: 50)
   - Acceso a gestión de mascotas y citas
   - Permisos: `pets.view`, `pets.edit`, `appointments.*`, `reports.*`, `veterinaries.*`

3. **asistente** (Prioridad: 30)
   - Permisos limitados para asistentes veterinarios
   - Permisos: `pets.view`, `appointments.*`, `veterinaries.view`

4. **recepcionista** (Prioridad: 20)
   - Acceso a citas y clientes
   - Permisos: `pets.view`, `appointments.*`, `veterinaries.view`

5. **cliente** (Prioridad: 10)
   - Acceso básico para clientes
   - Permisos: `pets.view`, `pets.create`, `appointments.view`, `appointments.create`, `veterinaries.view`

## 🔐 Nuevos Endpoints de Roles

### GET /api/roles
- Obtener todos los roles activos
- Requiere permiso: `roles.view`

### GET /api/roles/system
- Obtener roles del sistema
- Requiere permiso: `roles.view`

### GET /api/roles/custom
- Obtener roles personalizados
- Requiere permiso: `roles.view`

### POST /api/roles
- Crear nuevo rol
- Requiere permiso: `roles.create`

### PUT /api/roles/:id
- Actualizar rol existente
- Requiere permiso: `roles.edit`

### DELETE /api/roles/:id
- Eliminar rol (no permite eliminar roles del sistema)
- Requiere permiso: `roles.delete`

### GET /api/roles/:id/permissions
- Obtener permisos de un rol específico
- Requiere permisos: `roles.view`, `permissions.view`

### PUT /api/roles/:id/permissions
- Actualizar permisos de un rol
- Requiere permisos: `roles.edit`, `permissions.assign`

## 🔧 Cambios en Middleware

### Antes (Sistema basado en roles)
```javascript
// Verificación especial para admin
if (req.user.role === 'admin') {
  return next();
}
```

### Después (Sistema basado en permisos)
```javascript
// Verificación por permisos específicos
const hasPermission = await req.user.hasPermission('users.view');
if (hasPermission) {
  next();
}
```

## 📝 Cambios en Modelos

### Modelo User
- Eliminadas verificaciones especiales por rol
- Métodos `hasPermission`, `hasAnyPermission`, `hasAllPermissions` ahora solo verifican permisos
- Método `getDefaultPermissions` ahora consulta la base de datos

### Nuevo Modelo Role
- Almacena roles con sus permisos predeterminados
- Soporte para roles del sistema y personalizados
- Prioridad para ordenamiento
- Validación de permisos

## 🛠️ Scripts Disponibles

### seedRoles.js
- Crea los roles del sistema con sus permisos predeterminados
- El rol admin obtiene automáticamente todos los permisos disponibles

### migrateToPermissionBased.js
- Migra usuarios existentes al nuevo sistema
- Verifica que los roles existan en la base de datos
- Asigna permisos según el rol del usuario
- Valida permisos existentes

## ⚠️ Consideraciones Importantes

### 1. Compatibilidad
- Los usuarios existentes mantienen sus permisos personalizados
- Los roles que no existan en la base de datos se asignan como "cliente" por defecto

### 2. Seguridad
- Todos los endpoints ahora requieren permisos específicos
- No hay acceso automático por rol
- Los roles del sistema no se pueden modificar ni eliminar

### 3. Performance
- Las verificaciones de permisos ahora consultan la base de datos
- Se recomienda usar índices en los campos de permisos

## 🔍 Verificación Post-Migración

### 1. Verificar Roles
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/roles
```

### 2. Verificar Permisos de Usuario
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/users/YOUR_USER_ID
```

### 3. Verificar Funcionalidad
- Probar acceso a endpoints protegidos
- Verificar que los permisos funcionen correctamente
- Confirmar que no hay acceso no autorizado

## 🆘 Solución de Problemas

### Error: "Rol no encontrado"
- Ejecutar `npm run seed:roles` para crear los roles del sistema

### Error: "Permiso inválido"
- Ejecutar `npm run seed:permissions` para crear todos los permisos

### Usuarios sin permisos
- Ejecutar `npm run migrate:permissions` para asignar permisos según el rol

### Problemas de acceso
- Verificar que el usuario tenga los permisos necesarios
- Revisar los logs para identificar permisos faltantes

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisar los logs del servidor
2. Verificar la conectividad a la base de datos
3. Ejecutar los scripts de migración en orden
4. Verificar que todos los permisos y roles estén creados correctamente 