import { useEffect, useRef, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ChevronDown } from "lucide-react";
import { HiSparkles } from "react-icons/hi2";

interface AnalisisRiesgoIAProps {
  companyName: string;
  periodoCurrent: string;
  periodoAnterior: string;
  reportDate: string;
}

const COLLAPSE_HEIGHT = 555;

export default function AnalisisRiesgoIA({
  companyName,
  periodoCurrent,
  periodoAnterior,
  reportDate,
}: AnalisisRiesgoIAProps) {
  // Texto generado por IA (mock - en producción vendría de un servicio de IA)
  const analisisTexto = {
    introduccion: `${companyName}, dedicada a la venta de artículos para el hogar, presenta un perfil financiero contradictorio que requiere seguimiento especial. La empresa mantiene indicadores de liquidez sobresalientes con un capital de trabajo de $2,283 millones y una liquidez corriente de 4.54 veces, respaldada por disponibilidades líquidas que se incrementaron 75% interanual. Sin embargo, esta fortaleza aparente convive con señales preocupantes en su desempeño operativo y estructura de financiamiento.`,

    situacionFinanciera: `El aspecto más crítico es la caída del 24% en ventas netas (de $1,965M a $1,490M), combinada con una explosión en el endeudamiento bancario que pasó de prácticamente nulo ($2.6M en 2023) a $1,162M en 2024, incluyendo $892M de pasivo no corriente. Esta transformación radical de la estructura financiera sugiere una estrategia de financiamiento agresiva que no se tradujo en crecimiento de ventas. La rotación del capital de trabajo se hundió a 0,7x (1,4x en 2023), por debajo del mínimo deseable de 1,0x, evidenciando recursos inmovilizados y baja eficiencia operativa.`,

    comportamientoDeudor: `La trayectoria crediticia en el sistema financiero muestra volatilidad significativa: la empresa estuvo clasificada en situación 3 (con problemas) durante seis meses no consecutivos en 2024 y principios de 2025, evidenciando atrasos de 91-180 días. No obstante, desde mayo 2025 recuperó la situación 1 (normal) que mantiene actualmente, alineándose con el crecimiento de deuda bancaria de $599M a $1,724M en el último trimestre, lo que indica posible refinanciamiento o nueva línea de crédito que permitió normalizar pagos.`,

    chequesRechazados: `El historial de 31 cheques rechazados concentrados en agosto-octubre 2023 constituye un antecedente negativo, aunque todos fueron posteriormente regularizados y no se registran incidentes recientes.`,

    conclusion: `La rentabilidad operativa se mantiene saludable con margen del 23%, pero en descenso. El patrimonio neto creció moderadamente 8.5%, insuficiente para compensar el apalancamiento, elevando el endeudamiento de 11% a 33%, aunque dentro de niveles manejables.`,
  };

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);

  useEffect(() => {
    const node = contentRef.current;

    if (!node) {
      return;
    }

    const updateCollapsible = () => {
      const collapsible = node.scrollHeight > COLLAPSE_HEIGHT;

      setIsCollapsible(collapsible);
      if (!collapsible) {
        setIsExpanded(true);
      }
    };

    updateCollapsible();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateCollapsible);

      observer.observe(node);

      return () => observer.disconnect();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateCollapsible);

      return () => window.removeEventListener("resize", updateCollapsible);
    }

    return;
  }, []);

  const showGradient = isCollapsible && !isExpanded;

  return (
    <Card
      className="overflow-hidden border border-slate-200 shadow-sm"
      radius="sm"
      shadow="none"
    >
      <div className="flex items-center  gap-3 px-6 py-4 border-b border-gray-200/80 bg-white">
        <div className="rounded-xl bg-slate-100 p-3">
          <HiSparkles className="h-6 w-6 text-slate-500" />
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-lights text-black">
            Análisis de riesgo ejecutivo
          </h2>
        </div>
      </div>

      <CardBody className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>Fuente:</span>
          <Chip
            className="border border-slate-300 text-slate-500"
            radius="sm"
            size="sm"
            variant="bordered"
          >
            Estados Contables del {periodoCurrent}
          </Chip>
          <Chip
            className="border border-slate-300 text-slate-500"
            radius="sm"
            size="sm"
            variant="bordered"
          >
            Datos del BCRA al {reportDate}
          </Chip>
        </div>

        <div className="relative">
          <div
            ref={contentRef}
            className={`space-y-4 text-gray-700 leading-relaxed transition-[max-height] duration-300 ease-in-out ${showGradient ? "overflow-hidden" : ""}`}
            style={
              showGradient ? { maxHeight: `${COLLAPSE_HEIGHT}px` } : undefined
            }
          >
            <p className="text-[15px]">{analisisTexto.introduccion}</p>

            <p className="text-[15px]">{analisisTexto.situacionFinanciera}</p>

            <p className="text-[15px]">{analisisTexto.comportamientoDeudor}</p>

            <p className="text-[15px]">{analisisTexto.chequesRechazados}</p>

            <p className="text-[15px] font-medium">
              {analisisTexto.conclusion}
            </p>
          </div>

          {showGradient && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/60 to-transparent" />
          )}
        </div>

        {isCollapsible && (
          <div className="flex justify-center pt-4">
            <button
              aria-label={
                isExpanded ? "Colapsar análisis" : "Expandir análisis"
              }
              className="flex h-5 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-300 shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-3"
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
