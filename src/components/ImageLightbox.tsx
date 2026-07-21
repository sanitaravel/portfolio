"use client";

import { useEffect, useCallback, useState } from "react";

export default function ImageLightbox() {
  const [src, setSrc] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const close = useCallback(() => setSrc(null), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" && target.closest(".prose")) {
        const img = target as HTMLImageElement;
        setSrc(img.src);
        setAlt(img.alt || "");
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (src) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [src, close]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
      />
    </div>
  );
}
