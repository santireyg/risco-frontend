import { useEffect, useRef, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { ChevronDown } from "lucide-react";
import { HiSparkles } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface AnalisisRiesgoIAProps {
  reportDate: string;
  statementDate: string;
  reasonedAnalysis: string;
  executiveSummary: string;
}

const COLLAPSE_HEIGHT = 555;

export default function AnalisisRiesgoIA({
  reportDate,
  statementDate,
  reasonedAnalysis,
  executiveSummary,
}: AnalisisRiesgoIAProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsible, setIsCollapsible] = useState(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

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
    <Card className="overflow-hidden border border-slate-200 shadow-sm" radius="sm" shadow="none">
      <div className="flex items-center  gap-3 px-6 py-4 border-b border-gray-200/80 bg-white">
        <div className="rounded-xl bg-slate-100 p-3">
          <HiSparkles className="h-6 w-6 text-slate-500" />
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-lights text-black">Análisis de riesgo | Resumen ejecutivo</h2>
        </div>
      </div>

      <CardBody className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span>Fuente:</span>
          <Chip className="border border-slate-300 text-slate-500" radius="sm" size="sm" variant="bordered">
            Estados Contables del {statementDate}
          </Chip>
          <Chip className="border border-slate-300 text-slate-500" radius="sm" size="sm" variant="bordered">
            Datos del BCRA al {reportDate}
          </Chip>
        </div>

        {/* Expandable Razonamiento Analítico section */}
        <div className="mb-4">
          <button
            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-150"
            type="button"
            onClick={() => setIsReasoningExpanded((prev) => !prev)}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Razonamiento analítico</h3>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isReasoningExpanded ? "rotate-180" : ""}`} />
            </div>
          </button>
          {isReasoningExpanded && (
            <div className="mt-2 rounded-lg bg-gray-100 px-4 py-3">
              <div className="prose prose-sm max-w-none text-gray-600 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:text-xs [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:text-xs [&_li]:mb-1 [&_li]:pl-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {reasonedAnalysis}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div
            ref={contentRef}
            className={`text-gray-700 leading-relaxed transition-[max-height] duration-300 ease-in-out ${showGradient ? "overflow-hidden" : ""}`}
            style={showGradient ? { maxHeight: `${COLLAPSE_HEIGHT}px` } : undefined}>
            <div className="prose prose-sm max-w-none [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ul]:mt-2 [&_li]:text-[15px] [&_li]:mb-1.5 [&_li]:leading-relaxed [&_li]:pl-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {executiveSummary}
              </ReactMarkdown>
            </div>
          </div>

          {showGradient && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/60 to-transparent" />
          )}
        </div>

        {isCollapsible && (
          <div className="flex justify-center pt-4">
            <button
              aria-label={isExpanded ? "Colapsar análisis" : "Expandir análisis"}
              className="flex h-5 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-300 shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-3"
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
