// path: components/StatusChip.tsx

import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
// import { RxCross2 } from "react-icons/rx";
import { PiChecksBold } from "react-icons/pi";

interface StatusChipProps {
  status: string;
  progress?: number;
  errorMessage?: string;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  progress,
  errorMessage,
}) => {
  let chipColor:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined = "default";
  let chipVariant:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "dot"
    | undefined = "dot";
  let endContent = null;
  let startContent = null;
  let showTooltip = false;
  let tooltipContent = "";

  switch (status) {
    case "En cola":
      chipColor = "primary";
      chipVariant = "bordered";
      endContent = (
        <span>
          <Spinner color="primary" size="sm" />
        </span>
      );
      showTooltip = true;
      tooltipContent = "Documento a la espera de ser procesado";
      break;

    case "Cargando":
      chipColor = "warning";
      chipVariant = "bordered";
      endContent = (
        <span>
          <Spinner color="warning" size="sm" />
        </span>
      );
      showTooltip = true;
      tooltipContent = "El documento está siendo cargado al sistema";
      break;

    case "Convirtiendo":
      chipColor = "warning";
      endContent = (
        <span>
          <Spinner color="warning" size="sm" />
        </span>
      );
      showTooltip = true;
      tooltipContent = `Se esta conviertiendo el documento para su análisis ${progress !== undefined ? ` (${progress}%)` : ""}`;
      break;

    case "Reconociendo":
      chipColor = "warning";
      chipVariant = "bordered";
      endContent = (
        <span>
          <Spinner color="warning" size="sm" />
        </span>
      );
      showTooltip = true;
      tooltipContent = `Se esta llevando a cabo la lectura del documento ${progress !== undefined ? ` (${progress}%)` : ""}`;
      break;

    case "Reporte IA":
      chipColor = "warning";
      chipVariant = "bordered";
      endContent = (
        <span>
          <Spinner color="warning" size="sm" />
        </span>
      );
      showTooltip = true;
      tooltipContent =
        "Se está generando el reporte de IA. Esto puede demorar un minuto.";
      break;

    case "Analizando":
      chipColor = "warning";
      chipVariant = "bordered";
      endContent = (
        <span>
          <Spinner color="warning" size="sm" />
        </span>
      );
      showTooltip = true;
      tooltipContent = "Análisis y extracción en progreso";
      break;

    case "Validando":
      chipVariant = "bordered";
      chipColor = "warning";
      endContent = (
        <span className="ml-1">
          <Spinner color="warning" size="sm" />
        </span>
      );
      showTooltip = true;
      tooltipContent = "Validando ecuaciones contables";
      break;

    case "Analizado":
      chipColor = "success";
      showTooltip = true;
      tooltipContent = "Los datos han sido extraídos con éxito";
      break;

    case "Exportado":
      chipColor = "default";
      showTooltip = true;
      tooltipContent = "El balance ha sido exportado al sistema.";
      startContent = (
        <span className="ml-1">
          <PiChecksBold color="#17c964" size="1rem" />
        </span>
      );
      break;

    case "Error":
      chipColor = "danger";
      showTooltip = true;
      tooltipContent = `${errorMessage}`;
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
      startContent={startContent}
      variant={chipVariant}
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

export default StatusChip;
