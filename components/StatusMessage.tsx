// components/StatusMessage.tsx

import React from "react";

interface StatusMessageProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  message,
  onClose,
  className = "",
}) => {
  const baseClasses = "p-4 rounded-lg border-l-4 mb-4 relative";

  const typeClasses = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    info: "bg-blue-50 border-blue-500 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "ℹ",
  };

  // Procesar mensaje para mostrar saltos de línea
  const processedMessage = message.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < message.split("\n").length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <div className="flex items-start">
        <span aria-hidden="true" className="mr-2 text-lg font-bold">
          {icons[type]}
        </span>
        <div className="flex-1">{processedMessage}</div>
        {onClose && (
          <button
            aria-label="Cerrar mensaje"
            className="ml-2 text-lg font-bold opacity-70 hover:opacity-100 transition-opacity"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;
