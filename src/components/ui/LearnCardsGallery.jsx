import React, { useState, useEffect, useCallback } from "react";

// -------------------------------------------------------------
// UTILITY FUNCTION: IconPlaceholder
// -------------------------------------------------------------

const IconPlaceholder = ({ name, size = "text-3xl" }) => (
    <span className={`${size} text-pink-500 mr-2`} role="img" aria-label={name}>
        {name === 'chip' && '⚙️'}
        {name === 'code' && '💻'}
        {name === 'wrench' && '🤖'}
        {name === 'art' && '🎨'}
        {name === 'video' && '🎥'}
        {name === 'image' && '🖼️'}
    </span>
);

// -------------------------------------------------------------
// UTILITY FUNCTION: CategoryIcon
// -------------------------------------------------------------

const CategoryIcon = ({ title }) => {
    // Keyword to icon mapping
    const iconMap = {
        'hardware': '⚙️',
        'electronic': '💡',
        'circuit': '🔌',
        'robot': '🤖',
        'automation': '⚡',
        'iot': '📡',
        'sensor': '📊',
        'motor': '⚙️',
        'arduino': '🔧',
        'raspberry': '🍓',
        'code': '💻',
        'software': '💾',
        'web': '🌐',
        'app': '📱',
        'program': '⌨️',
        'algorithm': '🧮',
        'ai': '🧠',
        'machine learning': '🤖',
        'data': '📈',
        'design': '✍',
        'graphics': '🖼️',
        '3d': '🎲',
        'print': '🖨️',
        'model': '🗿',
        'art': '🎨',
        'video': '🎥',
        'animation': '🎬',
        'media': '📹',
        'audio': '🔊',
        'music': '🎵',
        'game': '🎮',
        'vr': '🥽',
        'project': '📁',
        'portfolio': '💼',
        'work': '🏆',
    };

    // Search for match in title (case insensitive)
    const lowerTitle = title.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerTitle.includes(key)) {
            return <span className="text-5xl">{icon}</span>;
        }
    }

    // Default icon
    return <span className="text-5xl">📂</span>;
};

// -------------------------------------------------------------
// CLOUDINARY CONFIGURATION
// -------------------------------------------------------------

const API_BASE_URL = import.meta.env.PUBLIC_API_URL;
const CLOUD_NAME = "drzikaxoj";

// -------------------------------------------------------------
// GALLERY VIEWER MODAL (Improved with optimized description)
// -------------------------------------------------------------

function GalleryViewer({ folderName, onClose }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const currentItem = items[currentIndex];

    const fetchFolderFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const API_ENDPOINT = `${API_BASE_URL}/api/gallery/${folderName}`;
            console.log(`🔍 Fetching files for folder: ${folderName}`);

            const response = await fetch(API_ENDPOINT);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: Failed to fetch gallery.`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Unknown error fetching resources.');
            }

            const mappedFiles = data.resources
                .map(file => ({
                    id: file.public_id,
                    name: file.public_id.split('/').pop()?.replace(/[-_]/g, ' ') || folderName,
                    description: file.description || 'No description',
                    type: file.resource_type,
                    secure_url: file.secure_url,
                }))
                .sort((a, b) => a.id.localeCompare(b.id));

            if (mappedFiles.length === 0) {
                setError(`No files found in folder "${folderName}".`);
            }

            setItems(mappedFiles);
            setLoading(false);
            setCurrentIndex(0);
        } catch (err) {
            console.error("❌ Error in GalleryViewer:", err);
            setError(err.message);
            setLoading(false);
        }
    }, [folderName]);

    useEffect(() => {
        fetchFolderFiles();
    }, [fetchFolderFiles]);

    const nextItem = () => {
        setCurrentIndex(prev => (prev + 1) % items.length);
        setShowFullDescription(false);
    };

    const prevItem = () => {
        setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
        setShowFullDescription(false);
    };

    useEffect(() => {
        const handleKeydown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && items.length > 1) nextItem();
            if (e.key === 'ArrowLeft' && items.length > 1) prevItem();
        };
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [onClose, items.length]);

    // Function to detect if description is long
    const isLongDescription = (text) => {
        return text && text.length > 100;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-2xl bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition z-50 shadow-xl"
                aria-label="Close Gallery"
            >
                ✕
            </button>

            <div
                className="relative w-full max-w-7xl max-h-[95vh] flex flex-col lg:flex-row rounded-xl shadow-2xl bg-zinc-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image container */}
                <div className="relative flex items-center justify-center flex-1 min-h-0 overflow-hidden p-2 sm:p-4 lg:w-2/3">
                    {loading && (
                        <div className="text-center text-white p-20">
                            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-pink-500/20 border-t-pink-500"></div>
                            <p className="mt-4">Loading projects from {folderName}...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-6 rounded-lg m-10 max-w-md">
                            <p className="font-bold">⚠️ Error loading gallery</p>
                            <p className="text-sm mt-2">{error}</p>
                            <p className="text-xs mt-3 opacity-80">API URL: {API_BASE_URL}/api/gallery/{folderName}</p>
                        </div>
                    )}

                    {!loading && items.length > 0 && currentItem && (
                        <>
                            {/* Viewer */}
                            <div className="w-full h-full flex items-center justify-center">
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
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            {items.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevItem(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/50 hover:bg-black/80 rounded-full w-14 h-14 flex items-center justify-center transition p-1"
                                        aria-label="Previous"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12 15.75 4.5" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextItem(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl bg-black/50 hover:bg-black/80 rounded-full w-14 h-14 flex items-center justify-center transition p-1"
                                        aria-label="Next"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12 8.25 19.5" /></svg>
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer/Sidebar Improved with expandable description */}
                {!loading && items.length > 0 && currentItem && (
                    <div className="bg-zinc-800 border-t lg:border-t-0 lg:border-l border-zinc-700 text-white flex-shrink-0 lg:w-1/3 max-h-[40vh] lg:max-h-none overflow-y-auto">
                        <div className="p-4 sm:p-6 lg:h-full lg:flex lg:flex-col">
                            {/* Project title */}
                            <div className="flex items-start justify-between gap-4 mb-3 lg:mb-4">
                                <h3 className="text-xl lg:text-2xl font-semibold text-pink-400">
                                    {currentItem.name}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-zinc-400 whitespace-nowrap">
                                    <span className="flex items-center">
                                        <IconPlaceholder name={currentItem.type} />
                                    </span>
                                    <span>{currentIndex + 1} / {items.length}</span>
                                </div>
                            </div>

                            {/* Description with expansion */}
                            <div className="relative lg:flex-1 lg:overflow-y-auto">
                                <p className={`whitespace-pre-wrap text-sm sm:text-base lg:text-base text-zinc-300 leading-relaxed transition-all duration-300 ${showFullDescription || !isLongDescription(currentItem.description)
                                    ? 'line-clamp-none'
                                    : 'line-clamp-2 lg:line-clamp-none'
                                    }`}>
                                    {currentItem.description}
                                </p>

                                {/* Expand/collapse button - mobile only */}
                                {isLongDescription(currentItem.description) && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="mt-2 text-sm text-pink-400 hover:text-pink-300 transition flex items-center gap-1 font-medium lg:hidden"
                                    >
                                        {showFullDescription ? (
                                            <>
                                                See less
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                See more
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
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
    const [openFolder, setOpenFolder] = useState(null);

    const openAlbum = (folderName) => {
        console.log('🎯 Opening Album:', folderName);
        setOpenFolder(folderName);
    };

    const closeAlbum = () => {
        console.log('❌ Closing Album');
        setOpenFolder(null);
    };

    const displayItems = items || [];

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 z-10">
                {displayItems.map((item) => (
                    <article
                        key={item.folder_name}
                        onClick={() => openAlbum(item.folder_name)}
                        role="button"
                        tabIndex="0"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openAlbum(item.folder_name);
                            }
                        }}
                        className="group z-10 rounded-2xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-pink-500 hover:-translate-y-1 cursor-pointer flex flex-col md:flex-row overflow-hidden"
                    >
                        {/* Image for medium/large screens */}
                        {item.image && (
                            <div className="hidden md:block md:w-2/5 h-[280px] overflow-hidden relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-yellow-100/30"></div>
                            </div>
                        )}

                        {/* Text content */}
                        <div className="p-6 flex flex-col justify-center md:w-3/5 w-full min-h-[200px] md:min-h-[280px]">
                            {/* Icon for mobile */}
                            <div className="md:hidden flex justify-center mb-4 opacity-80">
                                <CategoryIcon title={item.title} />
                            </div>

                            <h3 className="text-xl md:text-lg font-bold text-slate-900 group-hover:text-pink-600 transition-colors text-center md:text-left">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-sm md:text-sm text-slate-600 leading-relaxed text-center md:text-left">
                                {item.desc}
                            </p>

                            <div className="mt-5 inline-flex items-center justify-center md:justify-start text-pink-600 text-sm font-semibold group-hover:text-pink-700 transition-colors">
                                View Projects
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {openFolder && (
                <GalleryViewer
                    folderName={openFolder}
                    onClose={closeAlbum}
                />
            )}
        </>
    );
}