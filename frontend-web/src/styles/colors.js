// Paleta de colores para la aplicación veterinaria
export const colors = {
  // Colores principales
  mint: '#A8E6CF',      // Verde menta - calma y salud
  emerald: '#4CAF50',   // Verde esmeralda - vitalidad y naturaleza
  lightBlue: '#81D4FA', // Azul claro - confianza y limpieza
  white: '#FFFFFF',     // Blanco - pureza y claridad
  softGray: '#F5F5F5',  // Gris suave - equilibrio en fondos
  
  // Variaciones de los colores principales
  mintLight: '#C8F0D8',
  mintDark: '#8FD4B0',
  emeraldLight: '#66BB6A',
  emeraldDark: '#388E3C',
  lightBlueLight: '#A3E0FF',
  lightBlueDark: '#5BC0F2',
  
  // Colores de texto
  textPrimary: '#2D3748',
  textSecondary: '#4A5568',
  textMuted: '#718096',
  
  // Colores de estado
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#81D4FA',
  
  // Colores de fondo
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#E8F5E8',
  
  // Colores de borde
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E0',
  
  // Colores de sombra
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

// Clases de Tailwind CSS personalizadas
export const colorClasses = {
  // Fondos
  bgMint: 'bg-[#A8E6CF]',
  bgEmerald: 'bg-[#4CAF50]',
  bgLightBlue: 'bg-[#81D4FA]',
  bgSoftGray: 'bg-[#F5F5F5]',
  bgMintLight: 'bg-[#C8F0D8]',
  bgEmeraldLight: 'bg-[#66BB6A]',
  bgLightBlueLight: 'bg-[#A3E0FF]',
  
  // Texto
  textMint: 'text-[#A8E6CF]',
  textEmerald: 'text-[#4CAF50]',
  textLightBlue: 'text-[#81D4FA]',
  textSoftGray: 'text-[#F5F5F5]',
  
  // Bordes
  borderMint: 'border-[#A8E6CF]',
  borderEmerald: 'border-[#4CAF50]',
  borderLightBlue: 'border-[#81D4FA]',
  borderSoftGray: 'border-[#F5F5F5]',
  
  // Hover states
  hoverBgMint: 'hover:bg-[#C8F0D8]',
  hoverBgEmerald: 'hover:bg-[#66BB6A]',
  hoverBgLightBlue: 'hover:bg-[#A3E0FF]',
  
  // Focus states
  focusRingMint: 'focus:ring-[#A8E6CF]',
  focusRingEmerald: 'focus:ring-[#4CAF50]',
  focusRingLightBlue: 'focus:ring-[#81D4FA]',
};

// Configuración de tema
export const theme = {
  colors,
  colorClasses,
  
  // Configuración de componentes
  button: {
    primary: {
      background: colors.emerald,
      text: colors.white,
      hover: colors.emeraldLight,
      focus: colors.emeraldDark,
    },
    secondary: {
      background: colors.lightBlue,
      text: colors.white,
      hover: colors.lightBlueLight,
      focus: colors.lightBlueDark,
    },
    outline: {
      background: 'transparent',
      text: colors.emerald,
      border: colors.emerald,
      hover: colors.mintLight,
    },
    danger: {
      background: colors.error,
      text: colors.white,
      hover: '#D32F2F',
      focus: '#B71C1C',
    },
  },
  
  // Configuración de navegación
  navbar: {
    background: colors.white,
    text: colors.textPrimary,
    active: colors.emerald,
    hover: colors.mintLight,
  },
  
  // Configuración de formularios
  form: {
    background: colors.white,
    border: colors.border,
    focus: colors.lightBlue,
    error: colors.error,
    success: colors.success,
  },
  
  // Configuración de modales
  modal: {
    background: colors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
    border: colors.border,
  },
};
