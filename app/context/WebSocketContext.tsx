// path: app/context/WebSocketContext.tsx

"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";

// Interfaz para las actualizaciones de documentos recibidas por WebSocket
// Asegúrate que coincida con lo que envía el backend
export interface CompanyInfo {
  company_cuit?: string;
  company_name?: string;
  company_activity?: string;
  company_address?: string;
}

export interface ProcessingTime {
  upload_convert?: number | null; // Tiempo en segundos para carga y conversión
  recognize?: number | null; // Tiempo en segundos para reconocimiento
  extract?: number | null; // Tiempo en segundos para extracción
  validation?: number | null; // Tiempo en segundos para validación
  total?: number | null; // Tiempo total en segundos
}

export interface DocUpdate {
  id: string; // ID del documento actualizado
  status?: string;
  progress?: number | null;
  upload_date?: string;
  balance_date?: string;
  validation?: any; // Podrías tipar esto mejor
  ai_report?: any; // Podrías tipar esto mejor
  error_message?: string;
  company_info?: CompanyInfo;
  page_count?: number | null; // Número de páginas del documento
  processing_time?: ProcessingTime | null; // Tiempos de procesamiento por etapa
  // Añade otros campos que el backend pueda enviar
}

interface WebSocketContextType {
  docUpdates: Record<string, DocUpdate>; // Almacena la última actualización por ID
  isConnected: boolean; // Indica si el WebSocket está conectado
  lastMessage: DocUpdate | null; // El último mensaje recibido (opcional)
}

const WebSocketContext = createContext<WebSocketContextType>({
  docUpdates: {},
  isConnected: false,
  lastMessage: null,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [docUpdates, setDocUpdates] = useState<Record<string, DocUpdate>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<DocUpdate | null>(null);
  const ws = useRef<WebSocket | null>(null); // Usamos useRef para mantener la instancia del WebSocket

  useEffect(() => {
    // --- Lógica de Conexión WebSocket ---
    // Ya no se lee ninguna cookie desde JS. El navegador enviará la cookie HttpOnly 'token'
    // automáticamente si el backend está configurado correctamente (CORS, SameSite, Secure).

    // Construir la URL del WebSocket apuntando directamente al backend
    // Usa NEXT_PUBLIC_ para variables de entorno accesibles en el cliente
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // ej: http://localhost:8000 o https://api.tusitio.com

    if (!backendBaseUrl) {
      // console.error("[WS] Error: NEXT_PUBLIC_API_BASE_URL no está configurada.");
      return;
    }

    // Reemplaza http con ws o https con wss
    const wsUrl = backendBaseUrl.replace(/^http/, "ws") + "/ws";

    // console.log(`[WS] Intentando conectar a: ${wsUrl}`);

    // Crear la instancia del WebSocket (sin subprotocolo de token)
    ws.current = new WebSocket(wsUrl);
    const currentWs = ws.current; // Copia local para usar en el cleanup

    currentWs.onopen = () => {
      // console.log("[WS] Conexión abierta.");
      setIsConnected(true);
    };

    currentWs.onmessage = (event) => {
      // console.log("[WS] Mensaje recibido:", event.data);
      try {
        const data: DocUpdate = JSON.parse(event.data);

        if (data && data.id) {
          // Asegurarse que el mensaje tiene datos y un ID
          setLastMessage(data); // Guarda el último mensaje
          // Actualiza el estado de docUpdates con la información más reciente por ID
          setDocUpdates((prev) => ({
            ...prev,
            [data.id]: { ...(prev[data.id] || {}), ...data }, // Fusiona con datos previos si existen
          }));
        } else {
          // console.warn("[WS] Mensaje JSON recibido pero sin ID válido:", data);
        }
      } catch {
        // console.warn("[WS] Mensaje no JSON recibido:", event.data, e);
      }
    };

    currentWs.onerror = (_event) => {
      // El objeto 'event' en onerror no suele ser muy útil. Revisa la consola del navegador.
      // console.error("[WS] Error de conexión WebSocket. Verifica la URL, CORS del backend, y estado del servidor.", event);
    };

    currentWs.onclose = (_event) => {
      // console.log(`[WS] Conexión cerrada. Código: ${event.code}, Razón: ${event.reason || "(sin razón)"}`);
      setIsConnected(false);
      // Aquí podrías implementar lógica de reconexión si es necesario
      // Ejemplo simple de reconexión tras 5 segundos:
      // setTimeout(() => {
      //   // Volver a intentar conectar (quizás con un máximo de intentos)
      // }, 5000);
    };

    // --- Función de Limpieza ---
    // Se ejecuta cuando el componente se desmonta o antes de que el efecto se re-ejecute
    return () => {
      if (currentWs) {
        // console.log("[WS] Cerrando conexión WebSocket existente.");
        // Cierra explícitamente la conexión al desmontar
        currentWs.close();
      }
    };
    // El array vacío [] asegura que este efecto se ejecute solo una vez (al montar)
    // y la limpieza se ejecute al desmontar.
  }, []);

  return (
    <WebSocketContext.Provider value={{ docUpdates, isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook para consumir el contexto fácilmente
export const useWebSocket = () => useContext(WebSocketContext);
