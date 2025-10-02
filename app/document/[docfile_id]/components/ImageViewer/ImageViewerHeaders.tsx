// ruta: app/document/[docfile_id]/components/ImageViewerHeaders.tsx

import React from "react";
import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

interface ImageViewerHeadersProps {
  currentPage: number;
  totalPages: number;
  pageName: string;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const ImageViewerHeaders: React.FC<ImageViewerHeadersProps> = ({
  currentPage,
  totalPages,
  pageName,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="flex justify-between border border-gray items-center w-3/5 py-2 my-3 bg-white opacity-90 rounded-full shadow-lg mb-4 absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
      <span className="pl-4 text-gray-500">Page name: {pageName}</span>
      <div className="pr-2 flex items-center space-x-2">
        <Tooltip content="Previous">
          <Button
            isIconOnly
            className="rounded-full"
            isDisabled={currentPage === 0} // Cambiado a isDisabled
            size="sm"
            variant="bordered"
            onPress={onPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Tooltip>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <Tooltip content="Next">
          <Button
            isIconOnly
            className="rounded-full"
            isDisabled={currentPage === totalPages - 1} // Cambiado a isDisabled
            size="sm"
            variant="bordered"
            onPress={onNextPage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default ImageViewerHeaders;
