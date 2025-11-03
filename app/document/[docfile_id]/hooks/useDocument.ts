// app/document/[docfile_id]/hooks/useDocument.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useWebSocket } from "../../../context/WebSocketContext";
import { api, ApiError } from "../../../lib/apiClient"; // Importa tu apiClient
import { logger } from "../../../lib/logger";

function useDocument(docfile_id: string) {
  const [document, setDocument] = useState<any>(null);
  const [editableDocument, setEditableDocument] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { docUpdates } = useWebSocket();
  const router = useRouter(); // Para refrescar la página y redirigir

  const fetchDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>(`document/${docfile_id}`);

      setDocument(data);
      setEditableDocument(JSON.parse(JSON.stringify(data)));
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setError(
          "No autorizado para ver el documento. Por favor, inicie sesión.",
        );
        router.push("/login?expired=1");

        return;
      }
      setError("Error fetching document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [docfile_id]);

  // Actualiza el estado cuando llegue un update vía WebSocket
  useEffect(() => {
    if (docUpdates[docfile_id]) {
      const update = docUpdates[docfile_id];

      setDocument((prev: any) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: update.status ?? prev.status,
          progress:
            update.progress !== undefined ? update.progress : prev.progress,
          upload_date: update.upload_date ?? prev.upload_date,
          balance_date: update.balance_date ?? prev.balance_date,
          validation: update.validation ?? prev.validation,
          ai_report: update.ai_report ?? prev.ai_report,
          errorMessage: update.error_message ?? prev.errorMessage,
        };
      });

      // Refrescar o recargar la página basado en el estado recibido
      if (update.status) {
        if (
          ["Analizando", "Convirtiendo", "Reconociendo"].includes(update.status)
        ) {
          router.refresh();
        } else if (update.status === "Analizado") {
          window.location.reload();
        }
      }
    }
  }, [docUpdates, docfile_id, router]);

  // Función para guardar cambios
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updatedData = await api.put<any>(
        `update_docfile/${docfile_id}`,
        editableDocument,
      );

      setDocument(updatedData);
      setEditableDocument(JSON.parse(JSON.stringify(updatedData)));
      setIsEditing(false);
    } catch (err: any) {
      logger.error("Error al guardar cambios:", err);
      alert(`Error al guardar los cambios: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditableDocument(JSON.parse(JSON.stringify(document)));
    setIsEditing(false);
  };

  return {
    document,
    editableDocument,
    setEditableDocument,
    loading,
    error,
    isSaving,
    isEditing,
    setIsEditing,
    handleSaveChanges,
    handleCancelEdit,
  };
}

export default useDocument;
