// lib/apiClient.ts

import Cookies from "js-cookie";

import { logger } from "./logger";

/* ------------------------------------------------------------------ */
/*                         TIPOS Y UTILIDADES                         */
/* ------------------------------------------------------------------ */

interface CustomRequestInit extends RequestInit {
  silent?: boolean; // Opción para silenciar logs de errores (útil para checkSession)
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  responseBody?: any;

  constructor(message: string, status: number, statusText: string, responseBody?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!backendBaseUrl) {
  logger.error("NEXT_PUBLIC_API_BASE_URL is not defined!");
}

/* Lee la cookie CSRF y la devuelve como encabezado (si existe) */
function getCsrfHeader(): Record<string, string> {
  const csrf = Cookies.get("csrf_token");

  return csrf ? { "X-CSRF-Token": csrf } : {};
}

/* ------------------------------------------------------------------ */
/*                       FUNCIÓN BASE DE LLAMADAS                     */
/* ------------------------------------------------------------------ */

async function apiClient<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
  if (!backendBaseUrl) throw new Error("API Base URL is not configured.");

  const url = `${backendBaseUrl}/${endpoint.replace(/^\//, "")}`;
  const silent = options.silent || false;

  /* -------------------------------------------------- */
  /*            1) Construcción dinámica de headers     */
  /* -------------------------------------------------- */
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const method = (options.method || "GET").toUpperCase();

  /* Inyectamos CSRF sólo para métodos que cambian estado */
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    Object.assign(headers, getCsrfHeader());
  }

  /* Añadimos Content-Type *solo* si aún no existe y el body
     NO es FormData (en cuyo caso fetch lo pone por nosotros) */
  const isFormData = options.body instanceof FormData;

  if (!("Content-Type" in headers) && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const defaultOptions: RequestInit = {
    credentials: "include",
    ...options,
    headers,
  };

  /* -------------------------------------------------- */
  /*              2) Ejecución del fetch                */
  /* -------------------------------------------------- */
  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      let responseBody;

      try {
        responseBody = await response.json();
      } catch {
        try {
          responseBody = await response.text();
        } catch {
          responseBody = "No se pudo leer el cuerpo de la respuesta de error.";
        }
      }
      throw new ApiError(`API request failed: ${response.statusText}`, response.status, response.statusText, responseBody);
    }

    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      // Solo loggear si no está en modo silencioso o si no es un 401
      if (!silent || error.status !== 401) {
        logger.error(`API Error (${error.status}): ${error.message}`, error.responseBody);
      }
      throw error;
    }
    // Error de red (backend caído, CORS, etc.)
    if (!silent) {
      logger.error("Network error:", error);
    }
    throw new Error("No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.");
  }
}

/* ------------------------------------------------------------------ */
/*                 WRAPPERS ESPECÍFICOS (GET/POST/PUT/…)              */
/* ------------------------------------------------------------------ */

export const api = {
  get: <T>(endpoint: string, options?: CustomRequestInit) => apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: CustomRequestInit) => {
    let bodyToSend: BodyInit | null = null;
    const headers: Record<string, string> = {
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (body instanceof FormData) {
      bodyToSend = body;
      delete headers["Content-Type"];
    } else if (body instanceof URLSearchParams) {
      bodyToSend = body;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else if (typeof body === "object" && body !== null) {
      bodyToSend = JSON.stringify(body);
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    } else {
      bodyToSend = body as BodyInit;
      headers["Content-Type"] = headers["Content-Type"] || "text/plain";
    }

    return apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      headers,
      body: bodyToSend,
    });
  },

  put: <T>(endpoint: string, body: any, options?: CustomRequestInit) => {
    let bodyToSend: BodyInit | null = JSON.stringify(body);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (body instanceof FormData) {
      bodyToSend = body;
      delete headers["Content-Type"];
    } else if (body instanceof URLSearchParams) {
      bodyToSend = body;
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    return apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      headers,
      body: bodyToSend,
    });
  },

  delete: <T>(endpoint: string, options?: CustomRequestInit) => apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
