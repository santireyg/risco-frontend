// ruta: app/document/[docfile_id]/components/ImageViewerFooters.tsx

import React from "react";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { ZoomIn, ZoomOut, Crop, RotateCw } from "lucide-react";

interface ImageViewerFootersProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCrop: () => void;
  onRotate: () => void;
}

const ImageViewerFooters: React.FC<ImageViewerFootersProps> = ({
  onZoomIn,
  onZoomOut,
  onCrop,
  onRotate,
}) => {
  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-white opacity-90 p-2 my-3 rounded-full shadow-lg border border-gray">
      <div className="flex space-x-2">
        <Tooltip content="Zoom Out">
          <Button
            isIconOnly
            className="rounded-full"
            size="sm"
            onPress={onZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Zoom In">
          <Button
            isIconOnly
            className="rounded-full"
            size="sm"
            onPress={onZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
      <div className="w-px bg-gray-300 mx-2" />{" "}
      <div className="flex space-x-2">
        <Tooltip content="Crop">
          <Button
            isIconOnly
            className="rounded-full"
            size="sm"
            onPress={onCrop}
          >
            <Crop className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Rotate">
          <Button
            isIconOnly
            className="rounded-full"
            size="sm"
            onPress={onRotate}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ImageViewerFooters;
