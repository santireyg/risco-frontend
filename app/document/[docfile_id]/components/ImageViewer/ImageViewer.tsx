// app/document/[docfile_id]/components/ImageViewer.tsx

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Spinner } from "@heroui/spinner";

import { DocumentSheet } from "../types";

import ImageViewerHeaders from "./ImageViewerHeaders";
import ImageViewerFooters from "./ImageViewerFooters";

interface PreloadedImage {
  src: string;
  width: number;
  height: number;
}

interface ImageViewerProps {
  documentSheets: DocumentSheet[];
  currentPage: number;
  setCurrentPage: (page: (prev: number) => number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ documentSheets, currentPage, setCurrentPage }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<PreloadedImage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-cargar imágenes y almacenar sus dimensiones
  useEffect(() => {
    const preloadImages = async () => {
      try {
        const loadedImages = await Promise.all(
          documentSheets.map(
            (sheet) =>
              new Promise<PreloadedImage>((resolve, reject) => {
                const img = new window.Image();

                img.src = sheet.image_path;
                img.onload = () =>
                  resolve({
                    src: sheet.image_path,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                  });
                img.onerror = reject;
              })
          )
        );

        setPreloadedImages(loadedImages);
      } catch (_error) {
        // Manejar el error si es necesario.
      }
    };

    preloadImages();
  }, [documentSheets]);

  // Calcular zoom inicial para que la imagen quepa en el contenedor
  useEffect(() => {
    if (containerRef.current && preloadedImages[currentPage]) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const imageWidth = preloadedImages[currentPage].width;
      const imageHeight = preloadedImages[currentPage].height;
      // Calcula el factor de escala máximo que mantenga la proporción sin exceder el contenedor.
      const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight) * 0.95;

      setZoom(scale);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  }, [containerRef, preloadedImages, currentPage]);

  // Manejo del drag para mover la imagen
  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const currentSheet = documentSheets[currentPage];

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
    setPosition({ x: 0, y: 0 });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < documentSheets.length - 1 ? prev + 1 : prev));
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => prev + 0.15);
  };

  const handleZoomOut = () => {
    setZoom((prev) => (prev > 0.15 ? prev - 0.15 : prev));
  };

  const handleCrop = () => {
    // Funcionalidad de recorte (placeholder)
  };

  const handleRotate = () => {
    setRotation((prev) => prev + 90);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-4xl mx-auto relative">
      {currentSheet && (
        <ImageViewerHeaders
          currentPage={currentPage}
          pageName={currentSheet.name}
          totalPages={documentSheets.length}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />
      )}
      <div ref={containerRef} className="relative flex-grow w-full z-0 overflow-hidden flex items-center justify-center">
        {preloadedImages.length > 0 ? (
          // Contenedor absoluto centrado que envuelve la imagen
          <button
            className="overflow-hidden border border-gray-200 rounded-3xl shadow-md select-none cursor-grab"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: preloadedImages[currentPage].width,
              height: preloadedImages[currentPage].height,
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${
                (currentSheet?.rotation_degrees || 0) + rotation
              }deg) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.1s ease",
            }}
            onMouseDown={handleMouseDown}>
            <Image
              unoptimized
              alt={`Page ${currentSheet?.number || "N/A"}`}
              height={preloadedImages[currentPage].height}
              src={preloadedImages[currentPage].src}
              width={preloadedImages[currentPage].width}
            />
          </button>
        ) : (
          <div className="flex justify-center items-center h-full">
            <Spinner label="Cargando imagen..." variant="dots" />
          </div>
        )}
      </div>
      <ImageViewerFooters onCrop={handleCrop} onRotate={handleRotate} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
    </div>
  );
};

export default ImageViewer;
