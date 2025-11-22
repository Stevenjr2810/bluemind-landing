import { useState, useEffect } from "react";

export default function FlyersGallery() {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsToShow, setItemsToShow] = useState(6);

  // ⚙️ CONFIGURATION
  // Ensure your CLOUD_NAME is correct for your Cloudinary account
  const CLOUD_NAME = "drzikaxoj"; // Replace with your actual Cloud Name if different
  const FOLDER_NAME = "flyers"; // <--- Specific folder for flyers!

  // 🔧 API endpoint - automatically detects the environment
  // Ensure 'PUBLIC_API_URL' is configured in your Astro .env file
  const API_BASE_URL = import.meta.env.PUBLIC_API_URL;
  // We use the dedicated endpoint you created in the backend
  const API_ENDPOINT = `${API_BASE_URL}/api/flyers`;

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      console.log('🔍 Querying Flyers endpoint:', API_ENDPOINT);

      const response = await fetch(API_ENDPOINT);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch flyers. Please ensure your backend is running and the '/api/flyers' endpoint is functional.`);
      }

      const data = await response.json();
      console.log('✅ Flyers data received:', data);

      if (!data.success) {
        throw new Error(data.error || 'Unknown error fetching flyers');
      }

      // Filter to ensure we only process images if the backend returns videos as well
      // Flyers are usually images or PDFs converted to images.
      const flyerFiles = data.resources
        .filter(file => file.resource_type === 'image') // Ensure we only display images
        .map(file => ({
          id: file.public_id,
          name: file.public_id.split('/').pop()?.replace(/[-_]/g, ' ') || 'Flyer', // More readable name
          type: file.resource_type, // Should be 'image'
          format: file.format,
          width: file.width,
          height: file.height,
          secure_url: file.secure_url // Save the secure URL for the modal
        }));

      setFiles(flyerFiles);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error in FlyersGallery:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getThumbnailUrl = (file) => {
    // Generate an optimized thumbnail URL for grid display
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_600,c_fill,q_auto,f_auto,g_auto:subject/${file.id}`;
  };

  const getFullImageUrl = (file) => {
    // Use the secure URL directly for the high-resolution image in the modal
    // Cloudinary can automatically serve the optimized image with q_auto, f_auto
    return file.secure_url;
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
    <section id="flyers" className="bg-white text-slate-900 py-16 sm:py-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-center mb-8">Our Flyers</h2>
        <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedFiles.map((file) => (
            <div
              key={file.id}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => openItem(file)}
            >
              <div className="relative w-full aspect-[3/4] bg-gray-100"> {/* Adjust aspect ratio for flyers (more vertical) */}
                <img
                  src={getThumbnailUrl(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm font-medium truncate w-full">{file.name}</p>
                </div>

                <div className="absolute top-2 right-2">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    🖼️ Flyer
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
              className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-all duration-200 border border-pink-600 hover:border-pink-700 hover:scale-105"
            >
              Load more flyers
            </button>
            <p className="mt-4 text-slate-500 text-sm">
              Showing {displayedFiles.length} of {files.length} flyers
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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={getFullImageUrl(currentItem)}
                  alt={currentItem.name}
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                />
                <div className="p-4 bg-gray-100">
                  <p className="text-slate-900 font-medium">{currentItem.name}</p>
                  <p className="text-slate-600 text-sm mt-1">
                    {currentItem.width} × {currentItem.height} • {currentItem.format.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && files.length > 0 && !hasMore && (
          <div className="mt-8 text-center text-slate-500 text-sm">
            Showing all flyers ({files.length})
          </div>
        )}
      </div>
    </section>
  );
}