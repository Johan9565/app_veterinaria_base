#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de colores antiguos a nuevos
const colorMappings = {
  // Azules
  'bg-blue-': 'bg-[#81D4FA]',
  'text-blue-': 'text-[#81D4FA]',
  'border-blue-': 'border-[#81D4FA]',
  'hover:bg-blue-': 'hover:bg-[#A3E0FF]',
  'focus:ring-blue-': 'focus:ring-[#81D4FA]',
  'bg-blue-600': 'bg-[#4CAF50]',
  'text-blue-600': 'text-[#4CAF50]',
  'border-blue-600': 'border-[#4CAF50]',
  'hover:bg-blue-700': 'hover:bg-[#66BB6A]',
  'focus:ring-blue-500': 'focus:ring-[#4CAF50]',
  'bg-blue-100': 'bg-[#C8F0D8]',
  'text-blue-700': 'text-[#4CAF50]',
  'border-blue-500': 'border-[#4CAF50]',
  
  // Grises
  'bg-gray-': 'bg-[#F5F5F5]',
  'text-gray-': 'text-gray-',
  'border-gray-': 'border-[#E2E8F0]',
  'hover:bg-gray-': 'hover:bg-[#F5F5F5]',
  'hover:text-gray-': 'hover:text-gray-',
  
  // Verdes (mantener algunos para estados de éxito)
  'bg-green-600': 'bg-[#4CAF50]',
  'text-green-600': 'text-[#4CAF50]',
  'border-green-600': 'border-[#4CAF50]',
  'hover:bg-green-700': 'hover:bg-[#66BB6A]',
  'focus:ring-green-500': 'focus:ring-[#4CAF50]',
  
  // Gradientes
  'from-blue-50': 'from-[#C8F0D8]',
  'to-indigo-100': 'to-[#A3E0FF]',
  
  // Estados específicos
  'bg-blue-100 text-blue-700 border-blue-500': 'bg-[#C8F0D8] text-[#4CAF50] border-[#4CAF50]',
  'text-gray-600 hover:bg-gray-50 hover:text-gray-900': 'text-gray-600 hover:bg-[#F5F5F5] hover:text-gray-900',
};

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Aplicar mapeos de colores
    Object.entries(colorMappings).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, newColor);
    });
    
    // Si el contenido cambió, escribir el archivo
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath, extensions = ['.jsx', '.js', '.css']) {
  const items = fs.readdirSync(dirPath);
  let updatedCount = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules y .git
      if (item !== 'node_modules' && item !== '.git' && !item.startsWith('.')) {
        updatedCount += processDirectory(fullPath, extensions);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        if (processFile(fullPath)) {
          updatedCount++;
        }
      }
    }
  });
  
  return updatedCount;
}

// Función principal
function main() {
  const srcPath = path.join(__dirname, '..', 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ No se encontró el directorio src');
    process.exit(1);
  }
  
  console.log('🎨 Actualizando colores en el proyecto...');
  console.log('📁 Procesando directorio:', srcPath);
  
  const updatedCount = processDirectory(srcPath);
  
  console.log(`\n✨ Proceso completado!`);
  console.log(`📊 Archivos actualizados: ${updatedCount}`);
  
  if (updatedCount > 0) {
    console.log('\n🎯 Colores actualizados:');
    console.log('   • Verde menta (#A8E6CF) - Calma y salud');
    console.log('   • Verde esmeralda (#4CAF50) - Vitalidad y naturaleza');
    console.log('   • Azul claro (#81D4FA) - Confianza y limpieza');
    console.log('   • Blanco (#FFFFFF) - Pureza y claridad');
    console.log('   • Gris suave (#F5F5F5) - Equilibrio en fondos');
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processFile, processDirectory, colorMappings };
