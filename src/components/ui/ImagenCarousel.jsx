import { useEffect, useState } from "react";

export default function ImageCarousel({
  images,
  interval = 4000,
  alt = "Bluemind Skills",
}) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      // inicia el fade out
      setFade(false);
      // cambia la imagen justo cuando termina el fade out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setFade(true); // fade in
      }, 400); // duración del fade out (ms)
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
      <img
        src={images[index]}
        alt={alt}
        className={`aspect-[16/9] w-full rounded-xl object-cover transition-opacity duration-700 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

