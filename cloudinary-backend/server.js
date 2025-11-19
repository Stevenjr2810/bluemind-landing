const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:4321',
    'http://localhost:3000',
    'https://bluemindr.netlify.app',  // ✅ Tu sitio
    'https://*.netlify.app'            // Para previews
  ],
  credentials: true
};


app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend de Cloudinary funcionando ✅',
    endpoints: {
      'Galería completa': 'GET /api/gallery',
      'Por carpeta de assets': 'GET /api/gallery/:folder'
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
        resource_type: 'image'
      }),
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        resource_type: 'video'
      })
    ]);

    const allResources = [
      ...images.resources.map(r => ({ ...r, resource_type: 'image' })),
      ...videos.resources.map(r => ({ ...r, resource_type: 'video' }))
    ];

    // Agrupar por asset_folder
    const grouped = {};
    allResources.forEach(resource => {
      const folder = resource.asset_folder || 'Sin carpeta';
      if (!grouped[folder]) {
        grouped[folder] = [];
      }
      grouped[folder].push(resource);
    });

    console.log(`✅ Total: ${allResources.length} archivos`);
    console.log(`📁 Carpetas encontradas:`, Object.keys(grouped));

    res.json({
      success: true,
      total: allResources.length,
      folders: Object.keys(grouped),
      grouped_by_folder: grouped,
      all_resources: allResources
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
    
    console.log(`\n📂 Buscando archivos con asset_folder: "${folder}"`);
    
    // Obtener TODOS los recursos
    const [images, videos] = await Promise.all([
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        resource_type: 'image'
      }),
      cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        resource_type: 'video'
      })
    ]);

    const allResources = [
      ...images.resources.map(r => ({ ...r, resource_type: 'image' })),
      ...videos.resources.map(r => ({ ...r, resource_type: 'video' }))
    ];

    // FILTRAR por asset_folder
    const filtered = allResources.filter(resource => 
      resource.asset_folder === folder
    );

    console.log(`✅ Encontrados ${filtered.length} archivos en "${folder}"`);

    if (filtered.length === 0) {
      const availableFolders = [...new Set(allResources.map(r => r.asset_folder).filter(Boolean))];
      return res.status(404).json({
        success: false,
        message: `No se encontraron archivos en la carpeta "${folder}"`,
        available_folders: availableFolders,
        hint: `Carpetas disponibles: ${availableFolders.join(', ')}`
      });
    }

    res.json({
      success: true,
      folder: folder,
      total: filtered.length,
      resources: filtered
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  🚀 Servidor corriendo en http://localhost:${PORT}
  
  📍 Endpoints:
     📦 http://localhost:${PORT}/api/gallery (TODOS los archivos)
     📁 http://localhost:${PORT}/api/gallery/Gallery (solo carpeta Gallery)
  `);
});
