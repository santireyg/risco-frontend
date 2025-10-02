// path: components/ValidationChip.tsx

import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import React from "react";

// importar los iconos de CheckIcon y CrossIcon desde el archivo ValidationChipIcons.tsx

interface ValidationChipProps {
  status: string;
  progress?: number;
  message?: string[];
}

const ValidationChip: React.FC<ValidationChipProps> = ({
  status,
  progress,
  message,
}) => {
  let chipColor:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined = "default";
  let endContent = null;
  let showTooltip = false;
  let tooltipContent: React.ReactNode = "";

  switch (status) {
    case "no disponible":
      chipColor = "default";
      showTooltip = true;
      tooltipContent = "Aún no se ha realizado la validación";
      break;

    case "Validando":
      chipColor = "warning";
      endContent = <Spinner color="warning" size="sm" />;
      showTooltip = true;
      tooltipContent = `Progreso: ${progress}%`;
      break;

    case "Validado":
      chipColor = "success";
      showTooltip = true;
      tooltipContent = "Se han validado los resultados.";
      break;

    case "Advertencia":
      chipColor = "warning";
      showTooltip = true;
      tooltipContent = (
        <>
          <p className="mt-4 font-bold">
            Se han detectado inconsistencias o errores.
          </p>
          <p className="mt-1 mb-4">Se sugiere revisar los siguientes puntos:</p>
          <ul className="list-disc ml-5 text-blue-500 text-left">
            {message?.map((message, index) => (
              <li key={index} className="mb-2">
                <span className="block text-slate-800">
                  {message.split("\n")[0]}
                </span>
                <span className="block text-slate-400 italic">
                  {message.split("\n")[1]}
                </span>
              </li>
            ))}
          </ul>
        </>
      );
      break;

    case "Sin datos":
      chipColor = "default";
      showTooltip = true;
      tooltipContent = (
        <>
          <p className="mt-4 font-bold">Documento incompleto o incorrecto.</p>
          {message && message.length > 0 && (
            <p className="m-4 max-w-[320px] break-words">
              {message[0].split("\n").map((line, index, arr) => (
                <React.Fragment key={index}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}
        </>
      );
      break;

    default:
      break;
  }

  const chipContent = (
    <Chip
      className="border-none"
      color={chipColor}
      endContent={endContent}
      size="md"
      variant="dot"
    >
      {status}
    </Chip>
  );

  return showTooltip ? (
    <Tooltip closeDelay={0} content={tooltipContent} delay={0}>
      {chipContent}
    </Tooltip>
  ) : (
    chipContent
  );
};

export default ValidationChip;
