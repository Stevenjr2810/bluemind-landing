import React, { useState, useEffect, useCallback } from "react";

// -------------------------------------------------------------
// CONFIGURACIÓN
// -------------------------------------------------------------
const API_BASE_URL = import.meta.env.PUBLIC_API_URL;
const CLOUD_NAME = "drzikaxoj";
const FOLDER_NAME = "Gallery"; // Carpeta fija de donde sacar todas las imágenes

// -------------------------------------------------------------
// VISOR DE GALERÍA MODAL
// -------------------------------------------------------------
function GalleryViewer({ items, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentItem = items[currentIndex];

  const nextItem = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  const prevItem = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && items.length > 1) nextItem();
      if (e.key === 'ArrowLeft' && items.length > 1) prevItem();
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [onClose, items.length, nextItem, prevItem]);

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition z-50 shadow-xl"
        aria-label="Cerrar"
      >
        ✕
      </button>

      <div
        className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-xl shadow-2xl bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contenido */}
        <div className="relative flex items-center justify-center h-[calc(95vh-80px)]">
          <div className="w-full h-full flex items-center justify-center p-4">
            {currentItem.type === 'image' ? (
              <img
                src={currentItem.secure_url}
                alt={currentItem.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
              />
            ) : (
              <video
                controls
                src={currentItem.secure_url}
                className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                autoPlay
              >
                Tu navegador no soporta video.
              </video>
            )}
          </div>

          {/* Controles de navegación */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevItem(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full w-14 h-14 flex items-center justify-center transition"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12 15.75 4.5" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextItem(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full w-14 h-14 flex items-center justify-center transition"
                aria-label="Siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12 8.25 19.5" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="h-[80px] flex justify-between items-center p-4 bg-zinc-800 border-t border-zinc-700 text-white">
          <div>
            <p className="text-lg font-medium">{currentItem.name}</p>
            <p className="text-sm text-zinc-400">
              {currentItem.type === 'image' ? '🖼️ Image' : '🎥 Video'}
            </p>
          </div>
          <p className="text-sm text-zinc-400">
            {currentIndex + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL - COLLAGE GALLERY
// -------------------------------------------------------------
export default function ProjectsGallery() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const API_ENDPOINT = `${API_BASE_URL}/api/gallery/${FOLDER_NAME}`;

  // Fetch de archivos al montar
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Cargando galería desde:', API_ENDPOINT);

      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al obtener recursos');
      }

      const mappedFiles = data.resources.map(file => ({
        id: file.public_id,
        name: file.public_id.split('/').pop()?.replace(/[-_]/g, ' ') || 'Untitled',
        type: file.resource_type,
        secure_url: file.secure_url,
        width: file.width,
        height: file.height,
      }));

      console.log(`✅ ${mappedFiles.length} archivos cargados`);
      setFiles(mappedFiles);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailUrl = (file) => {
    if (file.type === 'video') {
      return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_600,h_600,c_fill,q_auto/${file.id}.jpg`;
    }
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,h_600,c_fill,q_auto,f_auto/${file.id}`;
  };

  const openViewer = (index) => {
    setSelectedIndex(index);
    setViewerOpen(true);
  };

  // Asignar tamaños random para el collage
  const getRandomSize = (index) => {
    const sizes = ['small', 'normal', 'wide', 'tall'];
    // Patrón variado pero controlado
    const pattern = [1, 0, 2, 1, 3, 1, 1, 2]; // índices del array sizes
    return sizes[pattern[index % pattern.length]];
  };

  const sizeClasses = {
    small: 'row-span-1 col-span-1',
    normal: 'row-span-2 col-span-1',
    wide: 'row-span-2 col-span-2',
    tall: 'row-span-3 col-span-1',
  };

  return (
    <>
      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-pink-500/20 border-t-pink-500"></div>
          <p className="mt-4 text-white/70">Loading gallery...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto bg-red-950/30 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-red-300 font-semibold mb-2">⚠️ Error loading gallery</h3>
          <p className="text-red-200/80 text-sm mb-4">{error}</p>
          <div className="bg-zinc-900 p-4 rounded text-xs text-white/80">
            <p>Endpoint: <code className="bg-black/30 px-1 rounded">{API_ENDPOINT}</code></p>
          </div>
        </div>
      )}

      {/* Collage vacío */}
      {!loading && !error && files.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📂</div>
          <p className="text-white/60 text-lg mb-2">No files found</p>
          <p className="text-white/40 text-sm">
            Upload images or videos to Cloudinary in the "<strong>{FOLDER_NAME}</strong>" folder
          </p>
        </div>
      )}

      {/* Grid Collage */}
      {!loading && !error && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[200px] gap-4">
          {files.map((file, index) => (
            <article
              key={file.id}
              onClick={() => openViewer(index)}
              className={`group relative overflow-hidden rounded-xl cursor-pointer ${sizeClasses[getRandomSize(index)]} min-h-[200px] bg-zinc-900`}
            >
              {/* Imagen */}
              <img
                src={getThumbnailUrl(file)}
                alt={file.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Badge tipo */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  {file.type === 'video' ? '🎥' : '🖼️'}
                </span>
              </div>

              {/* Nombre al hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-medium truncate">
                  {file.name}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Visor Modal */}
      {viewerOpen && files.length > 0 && (
        <GalleryViewer
          items={files}
          initialIndex={selectedIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
