const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:4321',
    'http://localhost:3000',
    'https://bluemindr.netlify.app',
    'https://*.netlify.app'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Lista de carpetas que pueden ser consultadas
const allowedFolders = ['gallery', 'flyers', 'electronic', 'programming', 'design', 'art'];

/**
 * Función auxiliar para extraer solo los campos clave y la descripción.
 * @param {object} resource - Objeto de recurso retornado por Cloudinary.
 */
const extractResourceData = (resource) => {
  // La descripción se almacena dentro de context.custom.description
  const description =
    resource.context && resource.context.custom && resource.context.custom.alt
      ? resource.context.custom.alt
      : null; // Si no hay descripción, devuelve null

  return {
    asset_id: resource.asset_id,
    public_id: resource.public_id,
    format: resource.format,
    version: resource.version,
    resource_type: resource.resource_type,
    created_at: resource.created_at,
    bytes: resource.bytes,
    width: resource.width,
    height: resource.height,
    asset_folder: resource.asset_folder,
    display_name: resource.display_name,
    url: resource.url,
    secure_url: resource.secure_url,
    context: resource.context,
    description: description, // ✅ NUEVO CAMPO DE DESCRIPCIÓN
  };
};



// ----------------------------------------
// RUTAS
// ----------------------------------------

// RUTAS DE INICIO (HOME)
app.get('/', (req, res) => {
  const folderExamples = allowedFolders.map(folder => `GET /api/gallery/${folder}`).join(', ');

  res.json({
    message: 'Backend de Cloudinary funcionando ✅',
    endpoints: {
      'Galería completa (Agrupada)': 'GET /api/gallery',
      'Archivos por carpeta (Genérico)': 'GET /api/gallery/:folder',
      'Ejemplos de carpetas': folderExamples,
    }
  });
});


// 📁 Obtener TODA la galería (todos los asset_folder)
app.get('/api/gallery', async (req, res) => {
  try {
    console.log('\n📂 Obteniendo toda la galería...');

    const [images, videos] = await Promise.all([
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        resource_type: 'image',
        context: true // Solicitar metadatos de contexto (donde está la descripción)
      }),
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        resource_type: 'video',
        context: true // Solicitar metadatos de contexto (donde está la descripción)
      })
    ]);

    const allResources = [
      ...images.resources.map(r => ({ ...r, resource_type: 'image' })),
      ...videos.resources.map(r => ({ ...r, resource_type: 'video' }))
    ];

    // Mapear para extraer la descripción
    const mappedResources = allResources.map(extractResourceData);


    // Agrupar por asset_folder
    const grouped = {};
    mappedResources.forEach(resource => {
      // Usar 'Sin carpeta' si no tiene asset_folder
      const folder = resource.asset_folder || 'Sin carpeta';
      if (!grouped[folder]) {
        grouped[folder] = [];
      }
      grouped[folder].push(resource);
    });

    console.log(`✅ Total: ${mappedResources.length} archivos`);
    console.log(`📁 Carpetas encontradas:`, Object.keys(grouped));

    res.json({
      success: true,
      total: mappedResources.length,
      folders: Object.keys(grouped),
      grouped_by_folder: grouped,
      all_resources: mappedResources
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// 📁 Obtener archivos de una carpeta específica (por asset_folder)
app.get('/api/gallery/:folder', async (req, res) => {
  try {
    const { folder } = req.params;

    // Validación simple...
    if (!allowedFolders.includes(folder.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `La carpeta "${folder}" no es una carpeta de categoría permitida.`,
        available_folders: allowedFolders,
      });
    }

    console.log(`\n📂 Buscando archivos con asset_folder: "${folder}"`);

    // Obtener TODOS los recursos
    const [images, videos] = await Promise.all([
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        resource_type: 'image',
        context: true // <-- PASO CLAVE 1
      }),
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        resource_type: 'video',
        context: true // <-- PASO CLAVE 1
      })
    ]);

    const allResources = [
      ...images.resources.map(r => ({ ...r, resource_type: 'image' })),
      ...videos.resources.map(r => ({ ...r, resource_type: 'video' }))
    ];

    // Mapear para extraer la descripción
    const mappedResources = allResources.map(extractResourceData);

    // FILTRAR por asset_folder (case-insensitive)
    const filtered = mappedResources.filter(resource =>
      resource.asset_folder && resource.asset_folder.toLowerCase() === folder.toLowerCase()
    );

    console.log(`✅ Encontrados ${filtered.length} archivos en "${folder}"`);

    if (filtered.length === 0) {
      const availableFolders = [...new Set(allResources.map(r => r.asset_folder).filter(Boolean))];
      return res.status(404).json({
        success: false,
        message: `No se encontraron archivos en la carpeta "${folder}"`,
        available_folders: availableFolders,
        hint: `Carpetas disponibles que contienen recursos: ${availableFolders.join(', ')}`
      });
    }

    res.json({
      success: true,
      folder: folder,
      total: filtered.length,
      resources: filtered // Incluye los recursos con la descripción mapeada
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ... (El endpoint /api/flyers ya fue eliminado, como mencionaste)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
    🚀 Servidor corriendo en http://localhost:${PORT}
    
    📍 Endpoints:
      📦 GET http://localhost:${PORT}/api/gallery (TODOS los archivos, agrupados)
      📁 GET http://localhost:${PORT}/api/gallery/electronic (Archivos de electrónica)
      📁 GET http://localhost:${PORT}/api/gallery/programming (Archivos de programación)
      📁 GET http://localhost:${PORT}/api/gallery/design (Archivos de diseño)
      📁 GET http://localhost:${PORT}/api/gallery/art (Archivos de arte)
      📁 GET http://localhost:${PORT}/api/gallery/flyers (Archivos de flyers)
    `);
});
