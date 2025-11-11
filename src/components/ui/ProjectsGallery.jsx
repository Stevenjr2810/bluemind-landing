import { useEffect, useState } from "react";

export default function ProjectsGallery({ albums = [] }) {
    const [open, setOpen] = useState(false);
    const [albumIdx, setAlbumIdx] = useState(0);
    const [mediaIdx, setMediaIdx] = useState(0);

    const currentAlbum = albums[albumIdx] ?? { items: [] };
    const items = currentAlbum.items ?? [];

    const openAlbum = (idx) => {
        setAlbumIdx(idx);
        setMediaIdx(0);
        setOpen(true);
    };

    const close = () => {
        document.querySelectorAll("video").forEach((v) => v.pause());
        setOpen(false);
    };

    const next = () => setMediaIdx((i) => (i + 1) % items.length);
    const prev = () => setMediaIdx((i) => (i - 1 + items.length) % items.length);

    // accesibilidad con teclado
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, items.length]);

    // bloquea scroll al abrir lightbox
    useEffect(() => {
        document.documentElement.style.overflow = open ? "hidden" : "";
    }, [open]);

    return (
        <>
            {/* Grid de álbumes */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((a, idx) => (
                    <button
                        key={a.id}
                        onClick={() => openAlbum(idx)}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-lg hover:shadow-pink-500/10"
                    >
                        {/* Imagen portada uniforme */}
                        <div className="aspect-[16/9] w-full overflow-hidden">
                            <img
                                src={a.cover}
                                alt={a.title}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>

                        {/* Contenido */}
                        <div className="flex grow flex-col p-4">
                            <h3 className="text-base font-semibold">{a.title}</h3>

                            {/* recorte de descripción */}
                            <p className="mt-1 text-sm text-white/70 line-clamp-2">
                                {a.desc}
                            </p>

                            <div className="mt-auto pt-2 text-xs text-white/50">
                                {a.items.length} items
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox */}
            {open && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={close}
                    aria-modal="true"
                    role="dialog"
                >
                    <div
                        className="relative m-4 w-full max-w-5xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="mb-3 flex items-center justify-between text-sm text-white/80">
                            <span className="font-semibold">{currentAlbum.title}</span>
                            <span>
                                {mediaIdx + 1}/{items.length}
                            </span>
                        </header>

                        {/* Forzar remount al cambiar de media */}
                        <div
                            key={items[mediaIdx]?.src || mediaIdx}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black"
                        >
                            {items[mediaIdx]?.type === "video" ? (
                                <video
                                    key={items[mediaIdx]?.src || mediaIdx}
                                    className="aspect-video h-full w-full"
                                    controls
                                    autoPlay
                                    muted
                                    playsInline
                                    poster={items[mediaIdx]?.poster}
                                >
                                    <source src={items[mediaIdx]?.src} type="video/mp4" />
                                </video>
                            ) : (
                                <img
                                    key={items[mediaIdx]?.src || mediaIdx}
                                    src={items[mediaIdx]?.src}
                                    alt=""
                                    className="aspect-video h-full w-full object-contain bg-black transition-opacity duration-300"
                                />
                            )}

                            {/* Controles */}
                            <button
                                onClick={prev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                                aria-label="Previous"
                            >
                                ‹
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                                aria-label="Next"
                            >
                                ›
                            </button>
                            <button
                                onClick={close}
                                className="absolute right-2 top-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Miniaturas */}
                        {items.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto">
                                {items.map((m, i) => (
                                    <button
                                        key={`${m.src}-${i}`}
                                        onClick={() => setMediaIdx(i)}
                                        className={`h-14 w-24 flex-shrink-0 overflow-hidden rounded-md border ${i === mediaIdx
                                                ? "border-pink-500"
                                                : "border-white/10 hover:border-white/20"
                                            }`}
                                        title={`Item ${i + 1}`}
                                    >
                                        {m.type === "video" ? (
                                            <div className="relative h-full w-full">
                                                {m.poster ? (
                                                    <img
                                                        src={m.poster}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-white/10 text-xs">
                                                        Video
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/30" />
                                                <div className="absolute inset-x-0 bottom-0 text-center text-[10px] text-white/90">
                                                    ▶
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={m.src}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

