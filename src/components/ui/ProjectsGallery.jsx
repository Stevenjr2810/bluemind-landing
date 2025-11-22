import { useState, useEffect } from "react";

export default function ProjectsGallery() {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsToShow, setItemsToShow] = useState(6);

  // ⚙️ CONFIGURATION
  const CLOUD_NAME = "drzikaxoj"; // Ensure this is your actual Cloudinary Cloud Name
  const FOLDER_NAME = "Gallery";

  // 🔧 API endpoint - automatically detects the environment
  const API_BASE_URL = import.meta.env.PUBLIC_API_URL;
  const API_ENDPOINT = `${API_BASE_URL}/api/gallery/${FOLDER_NAME}`;

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

      const mediaFiles = data.resources.map(file => ({
        id: file.public_id,
        name: file.public_id.split('/').pop(), // Consider cleaning this name for display
        type: file.resource_type,
        format: file.format,
        width: file.width,
        height: file.height
      }));

      setFiles(mediaFiles);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getThumbnailUrl = (file) => {
    if (file.type === 'video') {
      return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_400,h_300,c_fill,q_auto/${file.id}.jpg`;
    }
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${file.id}`;
  };

  const getFullImageUrl = (file) => {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_2000,q_auto,f_auto/${file.id}`;
  };

  const getVideoUrl = (file) => {
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${file.id}.${file.format}`;
  };

  const openItem = (item) => {
    setCurrentItem(item);
    setOpen(true);
  };

  const closeItem = () => {
    setOpen(false);
    setCurrentItem(null);
  };

  const loadMore = () => {
    setItemsToShow(prev => prev + 6);
  };

  const displayedFiles = files.slice(0, itemsToShow);
  const hasMore = itemsToShow < files.length;

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
            <h3 className="text-red-300 font-semibold mb-2">⚠️ Error loading gallery</h3>
            <p className="text-red-200/80 text-sm mb-4">{error}</p>
            <div className="bg-zinc-900 p-4 rounded text-xs text-white/80 space-y-3">
              <div>
                <p className="font-semibold mb-1">🔍 Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Backend URL: <code className="bg-black/30 px-1 rounded">{API_BASE_URL}</code></li>
                  <li>Endpoint: <code className="bg-black/30 px-1 rounded">{API_ENDPOINT}</code></li>
                </ul>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="font-semibold mb-1">🧪 Test manually:</p>
                <p className="text-white/60">
                  Open in your browser: <br />
                  <a
                    href={API_ENDPOINT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all underline"
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
            <div className="text-6xl mb-4">📂</div>
            <p className="text-white/60 mb-2">No files found</p>
            <p className="text-white/40 text-sm mb-6">
              Upload images or videos to Cloudinary in the "<strong>{FOLDER_NAME}</strong>" folder
            </p>
            <a
              href="https://console.cloudinary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Go to Cloudinary →
            </a>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedFiles.map((file) => (
            <div
              key={file.id}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900 transition-all cursor-pointer group"
              onClick={() => openItem(file)}
            >
              <div className="relative">
                <img
                  src={getThumbnailUrl(file)}
                  alt={file.name}
                  className="w-full h-56 object-cover bg-zinc-800"
                  loading="lazy"
                />

                {file.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-4">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm font-medium truncate w-full">{file.name}</p>
                </div>

                <div className="absolute top-2 right-2">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    {file.type === 'video' ? '🎥 Video' : '🖼️ Image'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-200 border border-white/20 hover:border-white/30 hover:scale-105"
            >
              Load more
            </button>
            <p className="mt-4 text-white/50 text-sm">
              Showing {displayedFiles.length} of {files.length} files
            </p>
          </div>
        )}

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
              className="relative w-full max-w-6xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {currentItem.type === 'image' ? (
                <div className="bg-zinc-900 rounded-lg overflow-hidden">
                  <img
                    src={getFullImageUrl(currentItem)}
                    alt={currentItem.name}
                    className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                  />
                  <div className="p-4 bg-zinc-800">
                    <p className="text-white font-medium">{currentItem.name}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {currentItem.width} × {currentItem.height} • {currentItem.format.toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : currentItem.type === 'video' ? (
                <div className="bg-zinc-900 rounded-lg overflow-hidden">
                  <video
                    src={getVideoUrl(currentItem)}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[80vh]"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="p-4 bg-zinc-800">
                    <p className="text-white font-medium">{currentItem.name}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {currentItem.width} × {currentItem.height} • {currentItem.format.toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {!loading && !error && files.length > 0 && !hasMore && (
          <div className="mt-8 text-center text-white/60 text-sm">
            Showing all files ({files.length})
          </div>
        )}
      </div>
    </section>
  );
}

