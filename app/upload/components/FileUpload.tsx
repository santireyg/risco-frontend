// app/upload/components/FileUpload.tsx

"use client";

import type { UploadProps, UploadFile, RcFile } from "antd/lib/upload/interface";

import React, { useState } from "react";
import { Upload, message, ConfigProvider, Divider } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Button } from "@heroui/button";

import useUploadFiles from "../hooks/useUploadFiles";

import SuccessMessage from "./SuccessMessage";

const { Dragger } = Upload;

const FileUpload: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const {
    handleUploadAndExtract,
    isUploading,
    uploadedFileNames,
    showSuccessMessage,
    setShowSuccessMessage: _setShowSuccessMessage,
    errorMessage,
    setErrorMessage,
  } = useUploadFiles(setFileList);

  const MAX_FILES = 5;

  const props: UploadProps = {
    name: "files",
    multiple: true,
    accept: "application/pdf",
    fileList,
    beforeUpload: (_file: RcFile) => {
      // Evita la subida automática y limita a 5 archivos
      if (fileList.length >= MAX_FILES) {
        message.error(`Solo puedes subir hasta ${MAX_FILES} archivos a la vez.`);

        return Upload.LIST_IGNORE;
      }

      return false;
    },
    onChange(info) {
      let newFileList = [...info.fileList];

      // Filtra solo PDFs
      newFileList = newFileList.filter((file) => {
        if (file.type !== "application/pdf") {
          message.error(`${file.name} no es un archivo PDF`);

          return false;
        }

        return true;
      });
      // Limita a 5 archivos
      if (newFileList.length > MAX_FILES) {
        message.error(`Solo puedes subir hasta ${MAX_FILES} archivos a la vez.`);
        newFileList = newFileList.slice(0, MAX_FILES);
      }
      setFileList(newFileList);
    },
    onDrop(e) {
      console.log("Archivos arrastrados", e.dataTransfer.files);
    },
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 10,
          colorSuccess: "#cbd5e1",
          fontFamily: `'Kumbh Sans', sans-serif`,
          colorSuccessBg: "#f1f5f9",
          colorSuccessBorder: "#cbd5e1",
        },
      }}>
      <div>
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="text-foreground-600 text-xl">Haga clic o arrastre archivos a esta área para subir</p>
          <p className="text-foreground-500 text-md my-2">Soporta carga única o múltiple. Solo se permiten archivos PDF.</p>
        </Dragger>

        <div className="flex space-x-2 mt-4">
          <Button
            color="primary"
            isDisabled={fileList.length === 0 || fileList.length > MAX_FILES || isUploading !== null}
            isLoading={isUploading === "uploadAndExtract"}
            radius="lg"
            size="md"
            variant="flat"
            onPress={() => handleUploadAndExtract(fileList)}>
            {isUploading === "uploadAndExtract" ? "Cargando..." : "Cargar y procesar archivos"}
          </Button>
        </div>

        <Divider className="my-8" />
        {errorMessage && (
          <div className="mt-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
              <button
                aria-label="Cerrar alerta"
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                type="button"
                onClick={() => setErrorMessage(null)}>
                ×
              </button>
            </div>
          </div>
        )}
        {showSuccessMessage && (
          <div className="mt-4">
            <SuccessMessage uploadedFileNames={uploadedFileNames} />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default FileUpload;
