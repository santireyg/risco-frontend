import { useEffect, useRef, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { AlertCircle, ChevronDown } from "lucide-react";
import { HiSparkles } from "react-icons/hi2";

import { formatCurrency } from "../../utils/formatting";

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
    introduccion: `${companyName} es una empresa argentina dedicada a la venta de artículos para el hogar, con sede en Ciudad Autónoma de Buenos Aires. Con un activo total de ${formatCurrency(
      4617318752,
    )} al cierre del período ${periodoCurrent}, la compañía se posiciona como un operador de tamaño mediano-grande en su sector.`,

    situacionFinanciera: `Desde la perspectiva financiera, la empresa presenta una situación mixta que requiere análisis detallado. Los ingresos operativos experimentaron una contracción significativa de 24.2%, pasando de ${formatCurrency(
      1965901234,
    )} a ${formatCurrency(
      1490489830,
    )}, lo que representa una señal de alerta importante. Sin embargo, la empresa mantiene una posición de liquidez robusta con un ratio corriente de 4.5x y disponibilidades por ${formatCurrency(
      1034356934,
    )}, lo que indica una fuerte capacidad para hacer frente a sus obligaciones de corto plazo. El capital de trabajo neto se sitúa en ${formatCurrency(
      2283388476,
    )}, representando un saludable 153% de las ventas anuales.`,

    comportamientoDeudor: `En cuanto al comportamiento crediticio reportado al BCRA, la empresa mantiene deudas con tres entidades financieras por un total de ${formatCurrency(
      944627,
    )} al período agosto 2025. Todas las deudas se encuentran en Situación 1 (normal), sin atrasos en pagos ni refinanciaciones. Se observa un incremento sustancial en la deuda con Banco Provincia (de situación 0 a ${formatCurrency(
      942123,
    )}), lo que sugiere nueva toma de financiamiento. Este movimiento debe monitorearse en contexto con la caída de ingresos observada.`,

    chequesRechazados: `Un aspecto crítico del análisis es la identificación de 7 cheques rechazados por falta de fondos durante 2023, totalizando ${formatCurrency(
      4800000,
    )}. Todos estos cheques fueron posteriormente regularizados en abril 2024, lo que demuestra voluntad de pago. Sin embargo, este comportamiento evidencia problemas de gestión de flujo de caja en el período analizado y constituye un antecedente negativo relevante para cualquier análisis de riesgo crediticio.`,

    conclusion: `Evaluación de Riesgo: MEDIO-ALTO. Si bien la empresa cuenta con indicadores de liquidez sólidos y ha regularizado sus incumplimientos pasados, la combinación de caída significativa en ventas (-24%), el historial reciente de cheques rechazados, y el incremento de endeudamiento sugieren cautela. Se recomienda: (1) solicitar información adicional sobre las causas de la caída de ingresos y perspectivas de recuperación, (2) monitorear estrechamente el comportamiento de pagos en los próximos períodos, (3) considerar límites de crédito conservadores hasta evidenciar estabilización de la operación. La garantía de caución debería contemplar estos factores de riesgo incrementado.`,
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
            Análisis de riesgo cualitativo
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
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-2">
                Contexto General
              </h3>
              <p className="text-[15px]">{analisisTexto.introduccion}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-2">
                Situación Financiera
              </h3>
              <p className="text-[15px]">{analisisTexto.situacionFinanciera}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-2">
                Comportamiento Crediticio (BCRA)
              </h3>
              <p className="text-[15px]">
                {analisisTexto.comportamientoDeudor}
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-danger mb-2">
                <AlertCircle className="h-4 w-4" />
                Cheques Rechazados
              </h3>
              <p className="text-[15px]">{analisisTexto.chequesRechazados}</p>
            </section>

            <section className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-2">
                Conclusión y Recomendación
              </h3>
              <p className="text-[15px] font-medium">
                {analisisTexto.conclusion}
              </p>
            </section>
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
