import React, { useState, useEffect, useCallback } from "react";

// -------------------------------------------------------------
// UTILITY FUNCTION: IconPlaceholder
// -------------------------------------------------------------

const IconPlaceholder = ({ name }) => (
    <span className="text-3xl text-pink-500 mr-2" role="img" aria-label={name}>
        {name === 'chip' && '⚙️'}
        {name === 'code' && '💻'}
        {name === 'wrench' && '🤖'}
        {name === 'art' && '🎨'}
        {name === 'video' && '🎥'}
        {name === 'image' && '🖼️'}
    </span>
);

// -------------------------------------------------------------
// CLOUDINARY CONFIGURATION
// -------------------------------------------------------------

// Assumes Astro injects PUBLIC_API_URL or uses localhost fallback
const API_BASE_URL = typeof import.meta.env.PUBLIC_API_URL !== 'undefined'
    ? import.meta.env.PUBLIC_API_URL
    : 'http://localhost:3001';

const CLOUD_NAME = "drzikaxoj"; // Replace with your actual Cloud Name


// -------------------------------------------------------------
// GALLERY VIEWER MODAL (Integrated)
// -------------------------------------------------------------


function GalleryViewer({ folderName, onClose }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentItem = items[currentIndex];

    // Function to fetch Cloudinary resources
    const fetchFolderFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Use the generic route: /api/gallery/:folder
            const API_ENDPOINT = `${API_BASE_URL}/api/gallery/${folderName}`;
            console.log(`🔍 Fetching files for folder: ${folderName}`); // Console log remains English

            const response = await fetch(API_ENDPOINT);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Translated Error Message
                throw new Error(errorData.message || `Error ${response.status}: Failed to fetch gallery.`);
            }

            const data = await response.json();

            if (!data.success) {
                // Translated Error Message
                throw new Error(data.error || 'Unknown error fetching resources.');
            }

            // Map files
            const mappedFiles = data.resources
                .map(file => ({
                    id: file.public_id,
                    name: file.public_id.split('/').pop()?.replace(/[-_]/g, ' ') || folderName,
                    type: file.resource_type, // 'image' or 'video'
                    secure_url: file.secure_url,
                }))
                .sort((a, b) => a.id.localeCompare(b.id));

            if (mappedFiles.length === 0) {
                // Translated Error Message
                setError(`No files found in folder "${folderName}".`);
            }

            setItems(mappedFiles);
            setLoading(false);
            setCurrentIndex(0); // Reset to the first item
        } catch (err) {
            console.error("❌ Error in GalleryViewer:", err); // Console log remains English
            setError(err.message);
            setLoading(false);
        }
    }, [folderName]);

    useEffect(() => {
        // Execute fetch when modal opens
        fetchFolderFiles();
    }, [fetchFolderFiles]);

    // Carousel navigation logic
    const nextItem = () => setCurrentIndex(prev => (prev + 1) % items.length);
    const prevItem = () => setCurrentIndex(prev => (prev - 1 + items.length) % items.length);

    // Keyboard handling (Escape, Arrows)
    useEffect(() => {
        const handleKeydown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && items.length > 1) nextItem();
            if (e.key === 'ArrowLeft' && items.length > 1) prevItem();
        };
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [onClose, items.length, nextItem, prevItem]);

    // Modal rendering
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-2xl bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition z-50 shadow-xl"
                aria-label="Close Gallery" // Translated Label
            >
                ✕
            </button>

            <div
                className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-xl shadow-2xl bg-zinc-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* -------------------- Modal Content -------------------- */}
                <div className="relative flex items-center justify-center h-[calc(90vh-60px)] sm:h-[calc(95vh-60px)]">
                    {loading && (
                        <div className="text-center text-white p-20">
                            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-pink-500/20 border-t-pink-500"></div>
                            {/* Translated Message */}
                            <p className="mt-4">Loading projects from {folderName}...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-lg m-10 max-w-md">
                            {/* Translated Message */}
                            <p className="font-bold">⚠️ Error loading gallery</p>
                            <p className="text-sm mt-2">{error}</p>
                            <p className="text-xs mt-3 opacity-80">API URL: {API_BASE_URL}/api/gallery/{folderName}</p>
                        </div>
                    )}

                    {!loading && items.length > 0 && currentItem && (
                        <>
                            {/* Viewer */}
                            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
                                {currentItem.type === 'image' ? (
                                    <img
                                        src={currentItem.secure_url}
                                        alt={currentItem.name}
                                        className="max-h-full max-w-full object-contain rounded-lg"
                                        loading="eager"
                                    />
                                ) : (
                                    <video
                                        controls
                                        src={currentItem.secure_url}
                                        alt={currentItem.name}
                                        className="max-h-full max-w-full object-contain rounded-lg"
                                    >
                                        {/* Translated Message */}
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            {/* Controls */}
                            {items.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevItem(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/50 hover:bg-black/80 rounded-full w-14 h-14 flex items-center justify-center transition p-1"
                                        aria-label="Previous" // Translated Label
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12 15.75 4.5" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextItem(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/50 hover:bg-black/80 rounded-full w-14 h-14 flex items-center justify-center transition p-1"
                                        aria-label="Next" // Translated Label
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12 8.25 19.5" /></svg>
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!loading && items.length > 0 && currentItem && (
                    <div className="h-[60px] flex justify-between items-center p-4 bg-zinc-800 border-t border-zinc-700 text-white">
                        <p className="text-lg font-medium truncate">
                            {currentItem.name}
                        </p>
                        <p className="text-sm text-zinc-400">
                            {currentIndex + 1} / {items.length}
                            <span className="ml-2 text-pink-500">
                                <IconPlaceholder name={currentItem.type} />
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// MAIN COMPONENT (LearnCardsGallery)
// -------------------------------------------------------------

export default function LearnCardsGallery({ items }) {
    // openFolder stores the 'folder_name' of the clicked album
    const [openFolder, setOpenFolder] = useState(null);

    const openAlbum = (folderName) => {
        console.log('🎯 Opening Album:', folderName); // Console log remains English
        setOpenFolder(folderName);
    };

    const closeAlbum = () => {
        console.log('❌ Closing Album'); // Console log remains English
        setOpenFolder(null);
    };

    // Fallback logic for when items is undefined or null (though Astro usually prevents this)
    const displayItems = items || [];

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayItems.map((item) => (
                    <article
                        key={item.folder_name} // Use folder_name as unique key
                        onClick={() => openAlbum(item.folder_name)}
                        role="button" // Indicates that this is an interactive element
                        tabIndex="0" // Makes the element focusable
                        onKeyDown={(e) => { // Allows click with Enter or Space
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openAlbum(item.folder_name);
                            }
                        }}
                        className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:border-pink-600 cursor-pointer flex flex-col md:flex-row h-[300px]"
                    >
                        {/* Image Container */}
                        {item.image && (
                            <div className="md:w-1/2 w-full h-full overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>
                        )}

                        {/* Text Container */}
                        <div className="p-6 flex flex-col justify-center md:w-1/2 w-full">
                            <h3 className="mt-0 text-lg font-semibold text-slate-900 group-hover:text-pink-600 transition">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600">
                                {item.desc}
                            </p>

                            <div className="mt-4 inline-flex items-center text-pink-600 text-sm font-medium">
                                View Projects {/* Translated Text */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Modal */}
            {openFolder && (
                <GalleryViewer
                    folderName={openFolder}
                    onClose={closeAlbum}
                />
            )}
        </>
    );
}