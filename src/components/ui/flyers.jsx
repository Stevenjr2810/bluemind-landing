import React, { useState, useEffect, useCallback } from "react";

// -------------------------------------------------------------
// CONFIGURACIÓN
// -------------------------------------------------------------
const CLOUD_NAME = "drzikaxoj";
const FOLDER_NAME = "flyers";
//ssa

// Detect environment
let API_BASE_URL = import.meta.env.PUBLIC_API_URL;
if (typeof import.meta !== 'undefined' && import.meta.env) {
  API_BASE_URL = import.meta.env.PUBLIC_API_URL || API_BASE_URL;
}

const API_ENDPOINT = `${API_BASE_URL}/api/gallery/${FOLDER_NAME}`;

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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition z-50"
        aria-label="Cerrar"
      >
        ✕
      </button>

      <div
        className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden rounded-xl shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-center h-[calc(95vh-80px)] bg-gray-100">
          <img
            src={currentItem.secure_url}
            alt={currentItem.name}
            className="max-h-full max-w-full object-contain"
          />

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevItem(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 bg-white/90 hover:bg-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-lg"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12 15.75 4.5" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextItem(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-900 bg-white/90 hover:bg-white rounded-full w-12 h-12 flex items-center justify-center transition shadow-lg"
                aria-label="Siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12 8.25 19.5" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="h-[80px] flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
          <div>
            <p className="text-lg font-medium text-slate-900">{currentItem.name}</p>
            <p className="text-sm text-slate-500">
              {currentItem.width} × {currentItem.height} • {currentItem.format?.toUpperCase()}
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {currentIndex + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------------
export default function FlyersGallery() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      console.log('🔍 Querying:', API_ENDPOINT);

      const response = await fetch(API_ENDPOINT);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch files. Please ensure your backend is running.`);
      }

      const data = await response.json();
      console.log('✅ Data received:', data);

      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      const flyerFiles = data.resources
        .filter(file => file.resource_type === 'image')
        .map(file => ({
          id: file.public_id,
          name: file.public_id.split('/').pop()?.replace(/[-_]/g, ' ') || 'Flyer',
          type: file.resource_type,
          format: file.format,
          width: file.width,
          height: file.height,
          secure_url: file.secure_url
        }));

      setFiles(flyerFiles);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getThumbnailUrl = (file) => {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_600,c_fill,q_auto,f_auto,g_auto:subject/${file.id}`;
  };

  const openViewer = (index) => {
    setSelectedIndex(index);
    setViewerOpen(true);
  };

  // Patrón de tamaños verticales
  const getVerticalSize = (index) => {
    const pattern = [1, 2, 1, 3, 1, 2, 1, 1];
    return pattern[index % pattern.length];
  };

  const sizeClasses = {
    1: 'row-span-2',
    2: 'row-span-3',
    3: 'row-span-4',
  };

  return (
    <section id="flyers" className="bg-orange-solid relative overflow-hidden text-slate-900 py-12 sm:py-24">

      {/* Formas SVG sólidas */}
      <div class="solid-shapes">
        {/* Blob 1 - Naranja Oscuro */}
        <svg
          class="solid-blob solid-blob-1"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ff6600"
            d="M47.1,-57.7C59.9,-45.8,68.5,-29.2,71.2,-11.9C73.9,5.4,70.7,23.4,61.3,37.9C51.9,52.4,36.3,63.4,19.1,68.1C1.9,72.8,-16.9,71.2,-33.5,64.1C-50.1,57,-64.5,44.4,-71.3,28.3C-78.1,12.2,-77.3,-7.4,-70.8,-23.8C-64.3,-40.2,-52.1,-53.4,-38.1,-65C-24.1,-76.6,-8.4,-86.6,5.2,-92.6C18.8,-98.6,34.3,-69.6,47.1,-57.7Z"
            transform="translate(100 100)"></path>
        </svg>

        {/* Blob 2 - Amarillo-Naranja */}
        <svg
          class="solid-blob solid-blob-2"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffcc00"
            d="M39.5,-52.6C49.5,-40.8,55.1,-26.1,58.5,-10.7C61.9,4.7,63.1,20.8,56.8,33.4C50.5,46,36.7,55.1,21.8,60.3C6.9,65.5,-9.1,66.8,-23.8,62.3C-38.5,57.8,-51.9,47.5,-60.4,33.9C-68.9,20.3,-72.5,3.4,-69.3,-12.1C-66.1,-27.6,-56.1,-41.7,-43.3,-53.1C-30.5,-64.5,-15.2,-73.2,0.3,-73.6C15.8,-74,29.5,-64.4,39.5,-52.6Z"
            transform="translate(100 100)"></path>
        </svg>

        {/* Blob 3 - Naranja Medio */}
        <svg
          class="solid-blob solid-blob-3"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ff8800"
            d="M44.3,-58.4C56.8,-48.2,65.6,-33.1,68.9,-17C72.2,-0.9,70,16.2,63.2,30.8C56.4,45.4,45,57.5,31.2,64.8C17.4,72.1,1.2,74.6,-14.5,72.3C-30.2,70,-45.4,62.9,-56.9,51.8C-68.4,40.7,-76.2,25.6,-77.5,9.8C-78.8,-6,-73.6,-22.5,-64.3,-36.2C-55,-49.9,-41.6,-60.8,-27.1,-70.3C-12.6,-79.8,2.9,-87.9,18.4,-86.1C33.9,-84.3,31.8,-68.6,44.3,-58.4Z"
            transform="translate(100 100)"></path>
        </svg>

        {/* Blob 4 - Amarillo Claro */}
        <svg
          class="solid-blob solid-blob-4"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffe135"
            d="M35.8,-48.9C45.6,-39.3,52.3,-26.9,56.8,-13.2C61.3,0.5,63.6,15.5,59.3,28.7C55,41.9,44.1,53.3,31.1,59.8C18.1,66.3,3,68,-11.7,66.5C-26.4,65,-40.7,60.3,-51.8,51.3C-62.9,42.3,-70.8,29,-73.3,14.7C-75.8,0.4,-73,-14.9,-65.8,-27.7C-58.6,-40.5,-46.9,-50.8,-34.3,-59.9C-21.7,-69,-8.5,-76.9,3.2,-81.3C14.9,-85.7,26,-85.5,35.8,-48.9Z"
            transform="translate(100 100)"></path>
        </svg>

        {/* Blob 5 - Naranja Base */}
        <svg
          class="solid-blob solid-blob-5"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffaa00"
            d="M42.7,-56.3C54.9,-46.5,64.3,-32.4,67.8,-17.2C71.3,-2,69,14.3,62.3,28.1C55.6,41.9,44.5,53.2,31.1,60.1C17.7,67,-7.9,69.5,-31.2,65.1C-54.5,60.7,-75.5,49.4,-83.1,32.8C-90.7,16.2,-84.9,-5.7,-75.3,-23.5C-65.7,-41.3,-52.3,-55,-37.4,-64.4C-22.5,-73.8,-6.1,-78.9,8.4,-89.1C22.9,-99.3,30.5,-66.1,42.7,-56.3Z"
            transform="translate(100 100)"></path>
        </svg>
      </div>

      {/* Formas geométricas */}
      <div class="geometric-shapes">
        <div class="geo-circle geo-circle-1"></div>
        <div class="geo-circle geo-circle-2"></div>
        <div class="geo-triangle triangle-1"></div>
        <div class="geo-triangle triangle-2"></div>
      </div>

      {/* Puntos sólidos */}
      <div class="solid-dots">
        <div class="solid-dot solid-dot-1"></div>
        <div class="solid-dot solid-dot-2"></div>
        <div class="solid-dot solid-dot-3"></div>
        <div class="solid-dot solid-dot-4"></div>
      </div>

      {/* Líneas decorativas */}
      <div class="deco-lines">
        <div class="deco-line line-1"></div>
        <div class="deco-line line-2"></div>
      </div>

      {/* Cuadrados rotativos */}
      <div class="rotating-square square-1"></div>
      <div class="rotating-square square-2"></div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-pink-500"
        >
          Flyers
        </h2>
        <p class="mt-4 text-slate-600 mb-6">
          Discover our latest flyers about upcoming events, classes, and workshops.
        </p>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-pink-600/20 border-t-pink-600"></div>
            <p className="mt-4 text-slate-600">Loading flyers...</p>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <div className="bg-red-50 p-4 rounded mt-4 text-xs text-red-800 space-y-3">
              <div>
                <p className="font-semibold mb-1">🔍 Debug Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Backend URL: <code className="bg-red-200 px-1 rounded">{API_BASE_URL}</code></li>
                  <li>Endpoint: <code className="bg-red-200 px-1 rounded">{API_ENDPOINT}</code></li>
                  <li>Expected Cloudinary Folder: <code className="bg-red-200 px-1 rounded">{FOLDER_NAME}</code></li>
                </ul>
              </div>
              <div className="border-t border-red-300 pt-3">
                <p className="font-semibold mb-1">🧪 Manual Test:</p>
                <p className="text-red-600">
                  Open in your browser: <br />
                  <a
                    href={API_ENDPOINT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all underline"
                  >
                    {API_ENDPOINT}
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 text-pink-600">📄</div>
            <p className="text-slate-600 mb-2">No flyers found</p>
            <p className="text-slate-500 text-sm mb-6">
              Upload your flyer files to Cloudinary in the "<strong>{FOLDER_NAME}</strong>" folder
            </p>
            <a
              href="https://console.cloudinary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
            >
              Go to Cloudinary →
            </a>
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-[180px] gap-4">
            {files.map((file, index) => (
              <div
                key={file.id}
                className={`group relative overflow-hidden rounded-lg cursor-pointer ${sizeClasses[getVerticalSize(index)]} bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300`}
                onClick={() => openViewer(index)}
              >
                <img
                  src={getThumbnailUrl(file)}
                  alt={file.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-pink-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                    🖼️ Flyer
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-lg">
                    {file.name}
                  </p>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-white via-transparent to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          <div className="mt-8 text-center text-slate-500 text-sm">
            Showing all flyers ({files.length})
          </div>
        )}

        {viewerOpen && files.length > 0 && (
          <GalleryViewer
            items={files}
            initialIndex={selectedIndex}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </div>
    </section>
  );
}