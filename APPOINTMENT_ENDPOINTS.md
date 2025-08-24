# Endpoints de Citas (Appointments)

## Descripción General

Los endpoints de citas permiten gestionar todas las operaciones relacionadas con las citas veterinarias, incluyendo creación, actualización, consulta y eliminación de citas.

## Base URL

```
/api/appointments
```

## Autenticación

Todos los endpoints requieren autenticación mediante token JWT en el header:

```
Authorization: Bearer <token>
```

## Endpoints Disponibles

### 1. Obtener Todas las Citas

**GET** `/api/appointments`

Obtiene todas las citas con filtros opcionales y paginación.

#### Parámetros de Query (opcionales):
- `page` (number): Número de página (default: 1)
- `limit` (number): Elementos por página (default: 10)
- `search` (string): Búsqueda en motivo, notas, diagnóstico o tratamiento
- `status` (string): Filtro por estado
- `type` (string): Filtro por tipo de cita
- `veterinary` (string): ID de la veterinaria
- `veterinarian` (string): ID del veterinario
- `owner` (string): ID del propietario
- `date` (string): Filtro por fecha (YYYY-MM-DD)
- `priority` (string): Filtro por prioridad

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "appointment_id",
        "pet": {
          "_id": "pet_id",
          "name": "Luna",
          "species": "perro",
          "breed": "Golden Retriever"
        },
        "owner": {
          "_id": "owner_id",
          "name": "Juan Pérez",
          "email": "juan@email.com",
          "phone": "1234567890"
        },
        "veterinary": {
          "_id": "veterinary_id",
          "name": "Veterinaria Central",
          "address": "Calle Principal 123"
        },
        "veterinarian": {
          "_id": "veterinarian_id",
          "name": "Dr. García"
        },
        "appointmentDate": "2024-01-15T00:00:00.000Z",
        "appointmentTime": "10:30",
        "duration": 30,
        "type": "consulta_general",
        "status": "programada",
        "priority": "normal",
        "reason": "Revisión anual",
        "symptoms": [],
        "notes": "",
        "cost": {
          "amount": 500,
          "currency": "MXN",
          "paid": false
        },
        "createdAt": "2024-01-10T10:00:00.000Z",
        "updatedAt": "2024-01-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalAppointments": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Obtener Cita por ID

**GET** `/api/appointments/:id`

Obtiene una cita específica por su ID.

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "appointment": {
      "_id": "appointment_id",
      "pet": {
        "_id": "pet_id",
        "name": "Luna",
        "species": "perro",
        "breed": "Golden Retriever",
        "gender": "hembra",
        "birthDate": "2020-05-15T00:00:00.000Z",
        "weight": {
          "value": 25,
          "unit": "kg"
        }
      },
      "owner": {
        "_id": "owner_id",
        "name": "Juan Pérez",
        "email": "juan@email.com",
        "phone": "1234567890"
      },
      "veterinary": {
        "_id": "veterinary_id",
        "name": "Veterinaria Central",
        "address": "Calle Principal 123",
        "phone": "9876543210"
      },
      "veterinarian": {
        "_id": "veterinarian_id",
        "name": "Dr. García",
        "email": "dr.garcia@vet.com",
        "phone": "5551234567"
      },
      "appointmentDate": "2024-01-15T00:00:00.000Z",
      "appointmentTime": "10:30",
      "duration": 30,
      "type": "consulta_general",
      "status": "programada",
      "priority": "normal",
      "reason": "Revisión anual",
      "symptoms": [],
      "notes": "",
      "diagnosis": "",
      "treatment": "",
      "prescription": [],
      "cost": {
        "amount": 500,
        "currency": "MXN",
        "paid": false
      },
      "followUp": {
        "required": false,
        "date": null,
        "notes": ""
      },
      "createdBy": {
        "_id": "user_id",
        "name": "Admin"
      },
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

### 3. Obtener Citas del Propietario

**GET** `/api/appointments/owner/:ownerId?`

Obtiene todas las citas de un propietario específico. Si no se proporciona `ownerId`, usa el ID del usuario autenticado.

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "appointment_id",
        "pet": {
          "_id": "pet_id",
          "name": "Luna",
          "species": "perro",
          "breed": "Golden Retriever"
        },
        "veterinary": {
          "_id": "veterinary_id",
          "name": "Veterinaria Central",
          "address": "Calle Principal 123"
        },
        "veterinarian": {
          "_id": "veterinarian_id",
          "name": "Dr. García"
        },
        "appointmentDate": "2024-01-15T00:00:00.000Z",
        "appointmentTime": "10:30",
        "type": "consulta_general",
        "status": "programada"
      }
    ]
  }
}
```

### 4. Obtener Citas de la Veterinaria

**GET** `/api/appointments/veterinary/:veterinaryId`

Obtiene todas las citas de una veterinaria específica.

### 5. Obtener Citas del Veterinario

**GET** `/api/appointments/veterinarian/:veterinarianId?`

Obtiene todas las citas de un veterinario específico. Si no se proporciona `veterinarianId`, usa el ID del usuario autenticado.

### 6. Obtener Citas por Fecha

**GET** `/api/appointments/date/:date`

Obtiene todas las citas de una fecha específica (formato: YYYY-MM-DD).

### 7. Crear Nueva Cita

**POST** `/api/appointments`

Crea una nueva cita.

#### Body:
```json
{
  "pet": "pet_id",
  "owner": "owner_id",
  "veterinary": "veterinary_id",
  "veterinarian": "veterinarian_id",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:30",
  "duration": 30,
  "type": "consulta_general",
  "priority": "normal",
  "reason": "Revisión anual",
  "symptoms": ["Fiebre", "Pérdida de apetito"],
  "notes": "Notas adicionales"
}
```

#### Campos Requeridos:
- `pet`: ID de la mascota
- `owner`: ID del propietario
- `veterinary`: ID de la veterinaria
- `veterinarian`: ID del veterinario
- `appointmentDate`: Fecha de la cita (YYYY-MM-DD)
- `appointmentTime`: Hora de la cita (HH:MM)
- `type`: Tipo de cita
- `reason`: Motivo de la cita

#### Campos Opcionales:
- `duration`: Duración en minutos (default: 30)
- `priority`: Prioridad (default: "normal")
- `symptoms`: Array de síntomas
- `notes`: Notas adicionales

#### Respuesta:
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "appointment": {
      "_id": "new_appointment_id",
      "pet": { /* datos de la mascota */ },
      "owner": { /* datos del propietario */ },
      "veterinary": { /* datos de la veterinaria */ },
      "veterinarian": { /* datos del veterinario */ },
      "appointmentDate": "2024-01-15T00:00:00.000Z",
      "appointmentTime": "10:30",
      "duration": 30,
      "type": "consulta_general",
      "status": "programada",
      "priority": "normal",
      "reason": "Revisión anual",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

### 8. Actualizar Cita

**PUT** `/api/appointments/:id`

Actualiza una cita existente.

#### Body:
```json
{
  "appointmentDate": "2024-01-16",
  "appointmentTime": "11:00",
  "duration": 45,
  "reason": "Revisión anual actualizada",
  "notes": "Notas actualizadas"
}
```

### 9. Actualizar Estado de la Cita

**PATCH** `/api/appointments/:id/status`

Actualiza el estado de una cita.

#### Body:
```json
{
  "status": "confirmada"
}
```

#### Estados Disponibles:
- `programada`
- `confirmada`
- `en_proceso`
- `completada`
- `cancelada`
- `no_show`

### 10. Marcar Cita como Pagada

**PATCH** `/api/appointments/:id/payment`

Marca una cita como pagada.

#### Body:
```json
{
  "paymentMethod": "tarjeta"
}
```

#### Métodos de Pago:
- `efectivo`
- `tarjeta`
- `transferencia`
- `otro`

### 11. Eliminar Cita

**DELETE** `/api/appointments/:id`

Elimina una cita (soft delete). Solo se pueden eliminar citas con estado "programada" o "cancelada".

### 12. Verificar Disponibilidad

**GET** `/api/appointments/availability`

Verifica la disponibilidad de un veterinario en una fecha y hora específica.

#### Parámetros de Query:
- `veterinary` (string): ID de la veterinaria
- `veterinarian` (string): ID del veterinario
- `date` (string): Fecha (YYYY-MM-DD)
- `time` (string): Hora (HH:MM)
- `duration` (number): Duración en minutos (default: 30)

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "available": true,
    "conflict": null
  }
}
```

### 13. Obtener Estadísticas

**GET** `/api/appointments/stats`

Obtiene estadísticas de citas.

#### Parámetros de Query (opcionales):
- `veterinary` (string): ID de la veterinaria
- `veterinarian` (string): ID del veterinario
- `startDate` (string): Fecha de inicio (YYYY-MM-DD)
- `endDate` (string): Fecha de fin (YYYY-MM-DD)

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "_id": "programada",
        "count": 25,
        "totalCost": 12500
      },
      {
        "_id": "completada",
        "count": 15,
        "totalCost": 7500
      }
    ],
    "totalAppointments": 40,
    "totalRevenue": 7500
  }
}
```

## Tipos de Cita

- `consulta_general`: Consulta General
- `vacunacion`: Vacunación
- `cirugia`: Cirugía
- `radiografia`: Radiografía
- `laboratorio`: Laboratorio
- `grooming`: Grooming
- `emergencia`: Emergencia
- `seguimiento`: Seguimiento
- `especialidad`: Especialidad
- `otro`: Otro

## Estados de Cita

- `programada`: Programada
- `confirmada`: Confirmada
- `en_proceso`: En Proceso
- `completada`: Completada
- `cancelada`: Cancelada
- `no_show`: No Show

## Prioridades

- `baja`: Baja
- `normal`: Normal
- `alta`: Alta
- `urgente`: Urgente

## Métodos de Pago

- `efectivo`: Efectivo
- `tarjeta`: Tarjeta
- `transferencia`: Transferencia
- `otro`: Otro

## Permisos Requeridos

- `appointments.read`: Ver citas
- `appointments.create`: Crear citas
- `appointments.update`: Actualizar citas
- `appointments.delete`: Eliminar citas
- `appointments.manage`: Gestionar citas
- `appointments.stats`: Ver estadísticas

## Validaciones

### Fechas y Horas
- Las citas deben ser programadas para fechas futuras
- El formato de hora debe ser HH:MM
- La duración debe estar entre 15 y 240 minutos

### Disponibilidad
- Se verifica automáticamente que no haya conflictos de horario
- No se pueden crear citas que se superpongan con citas existentes

### Relaciones
- La mascota debe pertenecer al propietario especificado
- El veterinario debe tener rol "veterinario"
- La veterinaria debe estar activa

## Códigos de Error

- `400`: Datos de entrada inválidos
- `401`: No autorizado
- `403`: Sin permisos
- `404`: Cita no encontrada
- `409`: Conflicto de horario
- `500`: Error interno del servidor

## Ejemplos de Uso

### Crear una cita de emergencia
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pet": "pet_id",
    "owner": "owner_id",
    "veterinary": "veterinary_id",
    "veterinarian": "veterinarian_id",
    "appointmentDate": "2024-01-15",
    "appointmentTime": "14:00",
    "duration": 60,
    "type": "emergencia",
    "priority": "urgente",
    "reason": "Accidente automovilístico, necesita atención inmediata",
    "symptoms": ["Sangrado", "Dolor intenso", "Dificultad para respirar"]
  }'
```

### Verificar disponibilidad
```bash
curl -X GET "http://localhost:5000/api/appointments/availability?veterinary=veterinary_id&veterinarian=veterinarian_id&date=2024-01-15&time=10:30&duration=30" \
  -H "Authorization: Bearer <token>"
```

### Actualizar estado de cita
```bash
curl -X PATCH http://localhost:5000/api/appointments/appointment_id/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "en_proceso"}'
```
