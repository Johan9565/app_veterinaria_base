# 🎨 Guía de Colores - Aplicación Veterinaria

Esta guía documenta la paleta de colores implementada en la aplicación veterinaria, diseñada para transmitir calma, confianza y profesionalismo.

## 🎯 Paleta Principal

### Colores Base
- **Verde Menta** `#A8E6CF` - Calma y salud
- **Verde Esmeralda** `#4CAF50` - Vitalidad y naturaleza  
- **Azul Claro** `#81D4FA` - Confianza y limpieza
- **Blanco** `#FFFFFF` - Pureza y claridad
- **Gris Suave** `#F5F5F5` - Equilibrio en fondos

### Variaciones
- **Verde Menta Claro** `#C8F0D8` - Fondos suaves
- **Verde Menta Oscuro** `#8FD4B0` - Acentos
- **Verde Esmeralda Claro** `#66BB6A` - Hover states
- **Verde Esmeralda Oscuro** `#388E3C` - Estados activos
- **Azul Claro Claro** `#A3E0FF` - Hover states
- **Azul Claro Oscuro** `#5BC0F2` - Estados activos

## 🎨 Uso por Componente

### Botones
```jsx
// Botón primario (Verde esmeralda)
<Button variant="primary">Acción Principal</Button>

// Botón secundario (Azul claro)
<Button variant="secondary">Acción Secundaria</Button>

// Botón outline (Verde esmeralda con borde)
<Button variant="outline">Acción Terciaria</Button>

// Botón de peligro (Rojo)
<Button variant="danger">Eliminar</Button>
```

### Navegación
```jsx
// Estado activo
className="bg-[#C8F0D8] text-[#4CAF50] border-[#4CAF50]"

// Estado hover
className="hover:bg-[#F5F5F5] hover:text-gray-900"
```

### Formularios
```jsx
// Input focus
className="focus:ring-[#81D4FA] focus:border-[#81D4FA]"

// Input error
className="border-red-500 focus:ring-red-500"

// Input success
className="border-[#4CAF50] focus:ring-[#4CAF50]"
```

### Modales
```jsx
// Header del modal
className="bg-[#F5F5F5] border-b border-[#E2E8F0]"

// Footer del modal
className="bg-[#F5F5F5] border-t border-[#E2E8F0]"

// Botón de cerrar
className="hover:text-[#4CAF50]"
```

## 🎨 Clases CSS Personalizadas

### Fondos
- `.bg-mint` - Fondo verde menta
- `.bg-emerald` - Fondo verde esmeralda
- `.bg-light-blue` - Fondo azul claro
- `.bg-soft-gray` - Fondo gris suave

### Texto
- `.text-mint` - Texto verde menta
- `.text-emerald` - Texto verde esmeralda
- `.text-light-blue` - Texto azul claro

### Bordes
- `.border-mint` - Borde verde menta
- `.border-emerald` - Borde verde esmeralda
- `.border-light-blue` - Borde azul claro

### Estados Hover
- `.hover-mint` - Hover verde menta
- `.hover-emerald` - Hover verde esmeralda
- `.hover-light-blue` - Hover azul claro

### Sombras
- `.shadow-custom` - Sombra estándar
- `.shadow-custom-light` - Sombra ligera
- `.shadow-custom-dark` - Sombra oscura

## 🎨 Variables CSS

```css
:root {
  --mint: #A8E6CF;
  --emerald: #4CAF50;
  --light-blue: #81D4FA;
  --white: #FFFFFF;
  --soft-gray: #F5F5F5;
  
  --mint-light: #C8F0D8;
  --mint-dark: #8FD4B0;
  --emerald-light: #66BB6A;
  --emerald-dark: #388E3C;
  --light-blue-light: #A3E0FF;
  --light-blue-dark: #5BC0F2;
}
```

## 🎨 Estados y Significado

### Estados de Éxito
- **Verde Esmeralda** `#4CAF50` - Operaciones exitosas, confirmaciones
- **Verde Menta Claro** `#C8F0D8` - Fondos de elementos exitosos

### Estados de Información
- **Azul Claro** `#81D4FA` - Información, enlaces, acciones secundarias
- **Azul Claro Claro** `#A3E0FF` - Hover states de elementos informativos

### Estados de Error
- **Rojo** `#F44336` - Errores, advertencias críticas
- **Naranja** `#FF9800` - Advertencias no críticas

### Estados Neutros
- **Gris Suave** `#F5F5F5` - Fondos, separadores
- **Blanco** `#FFFFFF` - Contenido principal, tarjetas

## 🎨 Aplicación por Sección

### Header/Navbar
- Logo: Verde esmeralda
- Navegación activa: Verde menta claro con texto verde esmeralda
- Hover: Gris suave

### Dashboard
- Fondo: Gris suave
- Tarjetas: Blanco con bordes suaves
- Iconos: Verde esmeralda, azul claro, verde menta

### Formularios
- Labels: Gris oscuro
- Inputs: Borde gris, focus azul claro
- Botones: Verde esmeralda (primario), azul claro (secundario)

### Modales
- Header/Footer: Gris suave
- Contenido: Blanco
- Botones: Verde esmeralda (confirmar), gris (cancelar)

### Tablas
- Header: Gris suave
- Filas: Blanco
- Hover: Verde menta claro

## 🎨 Accesibilidad

### Contraste
- Verde esmeralda sobre blanco: ✅ Excelente contraste
- Verde menta sobre texto oscuro: ✅ Buen contraste
- Azul claro sobre blanco: ✅ Buen contraste

### Estados de Foco
- Todos los elementos interactivos tienen estados de foco visibles
- Uso de `focus:ring` para indicar foco
- Colores de foco: Azul claro para inputs, verde esmeralda para botones

## 🎨 Implementación

### Archivos Principales
- `src/styles/colors.js` - Configuración de colores
- `src/styles/global.css` - Estilos globales
- `src/components/ui/Button.jsx` - Botones con nueva paleta
- `src/components/ui/Input.jsx` - Inputs con nueva paleta

### Script de Actualización
- `scripts/update-colors.js` - Script para actualizar colores automáticamente

## 🎨 Mejores Prácticas

1. **Consistencia**: Usar siempre los colores definidos en la paleta
2. **Jerarquía**: Verde esmeralda para acciones principales, azul claro para secundarias
3. **Estados**: Usar variaciones claras para hover, oscuras para activo
4. **Accesibilidad**: Mantener contraste adecuado en todos los elementos
5. **Semántica**: Usar colores según su significado (éxito, error, información)

## 🎨 Ejemplos de Uso

```jsx
// Card con nueva paleta
<div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-custom-light">
  <div className="h-12 w-12 bg-[#C8F0D8] rounded-lg flex items-center justify-center mb-4">
    <Icon className="h-6 w-6 text-[#4CAF50]" />
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">Título</h3>
  <p className="text-gray-600">Descripción</p>
</div>

// Botón con hover personalizado
<button className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg hover:bg-[#66BB6A] transition-colors">
  Acción
</button>
```

Esta paleta de colores está diseñada para crear una experiencia visual coherente y profesional que transmita confianza y calma, perfecta para una aplicación veterinaria.
