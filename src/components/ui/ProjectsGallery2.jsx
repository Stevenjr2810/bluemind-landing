import { useState, useEffect } from "react";

export default function ProjectsGallery() {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiKey = "AIzaSyAjnpvI-rPVtYen7w5vAYfPUP_BPUcD2lQ";
  const folderId = "10LM8tv9iqblme4hB2BRQ0ks5dHNOH6IV";

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${apiKey}&fields=files(id,name,mimeType)&pageSize=50`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Error al obtener archivos');
        }
        
        const data = await response.json();
        console.log("Archivos obtenidos:", data.files);
        
        const mediaFiles = (data.files || []).filter(file => 
          file.mimeType.includes('image') || file.mimeType.includes('video')
        );
        
        setFiles(mediaFiles);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Esta es la URL correcta para archivos públicos de Google Drive
  const getPublicImageUrl = (fileId) => {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  };

  const getPublicVideoUrl = (fileId) => {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const openItem = (item) => {
    setCurrentItem(item);
    setOpen(true);
  };

  const closeItem = () => {
    setOpen(false);
    setCurrentItem(null);
  };

  return (
    <section id="projects" className="bg-zinc-950 text-white py-16 sm:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-center mb-8">Our Projects</h2>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white/20 border-t-white"></div>
            <p className="mt-4 text-white/70">Loading projects...</p>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto bg-red-950/30 border border-red-500/30 rounded-xl p-6">
            <h3 className="text-red-300 font-semibold mb-2">⚠️ Error</h3>
            <p className="text-red-200/80 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/60">No se encontraron archivos multimedia</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900 transition-all cursor-pointer group"
              onClick={() => openItem(file)}
            >
              {file.mimeType.includes("image") ? (
                <div className="relative">
                  <img
                    src={getPublicImageUrl(file.id)}
                    alt={file.name}
                    className="w-full h-56 object-cover bg-zinc-800"
                    loading="lazy"
                    onError={(e) => {
                      console.error(`Error cargando: ${file.name}`);
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-56 bg-zinc-800 flex items-center justify-center">
                          <div class="text-center p-4">
                            <svg class="w-12 h-12 mx-auto text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-xs text-white/60">${file.name}</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium truncate w-full">{file.name}</p>
                  </div>
                </div>
              ) : file.mimeType.includes("video") ? (
                <div className="relative">
                  <div className="w-full h-56 bg-zinc-800 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium truncate w-full">{file.name}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Modal/Lightbox */}
        {open && currentItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={closeItem}
          >
            <button
              onClick={closeItem}
              className="absolute top-4 right-4 text-white text-2xl bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition z-50"
            >
              ✕
            </button>

            <div
              className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {currentItem.mimeType.includes("image") ? (
                <div className="bg-zinc-900 rounded-lg overflow-hidden">
                  <img
                    src={getPublicImageUrl(currentItem.id)}
                    alt={currentItem.name}
                    className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                    onError={(e) => {
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-96 flex items-center justify-center bg-zinc-800">
                          <div class="text-center">
                            <p class="text-white/80 mb-2">No se pudo cargar la imagen</p>
                            <p class="text-white/60 text-sm">${currentItem.name}</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div className="p-4 bg-zinc-800">
                    <p className="text-white font-medium">{currentItem.name}</p>
                  </div>
                </div>
              ) : currentItem.mimeType.includes("video") ? (
                <div className="bg-zinc-900 rounded-lg overflow-hidden">
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      src={getPublicVideoUrl(currentItem.id)}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4 bg-zinc-800">
                    <p className="text-white font-medium">{currentItem.name}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          <div className="mt-8 text-center text-white/60 text-sm">
            {files.length} {files.length === 1 ? 'archivo encontrado' : 'archivos encontrados'}
          </div>
        )}
      </div>
    </section>
  );
}