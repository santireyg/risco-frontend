// app/upload/hooks/useUploadFiles.ts

import type { UploadFile } from "antd/lib/upload/interface";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api, ApiError } from "../../lib/apiClient"; // Importa tu apiClient

/**
 * Hook para manejar la subida y el procesamiento de archivos PDF utilizando apiClient.
 */
const useUploadFiles = (setFileList: (files: UploadFile[]) => void) => {
  const [isUploading, setIsUploading] = useState<"uploadAndExtract" | null>(
    null,
  );
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleUploadAndExtract = async (fileList: UploadFile[]) => {
    if (!fileList.length) return;
    setIsUploading("uploadAndExtract");
    setErrorMessage(null);

    const formData = new FormData();

    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("files", file.originFileObj as Blob, file.name);
      }
    });

    try {
      await api.post<any>("complete_process_batch/", formData);
      setUploadedFileNames(fileList.map((f) => f.name));
      setShowSuccessMessage(true);
      setFileList([]);
    } catch (error: any) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setErrorMessage(
            "No autorizado para subir archivos. Por favor, inicie sesión.",
          );
          router.push("/login?expired=1");

          return;
        } else if (error.status === 429) {
          const detail =
            error.responseBody?.detail ||
            "Demasiadas solicitudes. Intenta nuevamente en un minuto.";

          setErrorMessage(detail);

          return;
        } else if (
          error.status === 400 ||
          error.status === 403 ||
          error.status === 500
        ) {
          const detail = error.responseBody?.detail || error.message;

          setErrorMessage(detail);

          return;
        }
      }
      console.error("Error uploading files:", error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(null);
    }
  };

  return {
    handleUploadAndExtract,
    isUploading,
    uploadedFileNames,
    showSuccessMessage,
    setShowSuccessMessage,
    errorMessage,
    setErrorMessage,
  };
};

export default useUploadFiles;
