import AnalisisRiesgoIA from "../tabs-components/resumen-ejecutivo/AnalisisRiesgoIA";
import KeyInsights from "../tabs-components/resumen-ejecutivo/KeyInsights";
import CapitalTrabajo from "../tabs-components/resumen-ejecutivo/CapitalTrabajo";
import KPIsFinancieros from "../tabs-components/resumen-ejecutivo/KPIsFinancieros";
import EstadoDeudor from "../tabs-components/resumen-ejecutivo/EstadoDeudor";
import ChequesRechazados from "../tabs-components/resumen-ejecutivo/ChequesRechazados";
import {
  EstadosContables,
  DebtHistory,
  ChequesRechazados as ChequesRechazadosType,
} from "../../types";
import {
  calculateCapitalTrabajo,
  calculateAllKPIs,
} from "../../utils/calculations";
import { formatDate } from "../../utils/formatting";

interface ResumenEjecutivoProps {
  estadosContables: EstadosContables;
  deudasHistoria: DebtHistory;
  chequesRechazados: ChequesRechazadosType;
  reportDate: string;
}

export default function ResumenEjecutivo({
  estadosContables,
  deudasHistoria,
  chequesRechazados,
  reportDate,
}: ResumenEjecutivoProps) {
  const capitalTrabajo = calculateCapitalTrabajo(estadosContables);
  const kpis = calculateAllKPIs(estadosContables);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda - 60% */}
      <div className="lg:col-span-7 space-y-6">
        <AnalisisRiesgoIA
          companyName={estadosContables.company_info.company_name}
          periodoAnterior={formatDate(
            estadosContables.balance_date_previous.$date,
          )}
          periodoCurrent={formatDate(estadosContables.balance_date.$date)}
          reportDate={reportDate}
        />
        <KeyInsights />
      </div>

      {/* Columna Derecha - 40% */}
      <div className="lg:col-span-5 space-y-6">
        <CapitalTrabajo data={capitalTrabajo} />
        <KPIsFinancieros kpis={kpis} />
        <EstadoDeudor data={deudasHistoria} />
        <ChequesRechazados data={chequesRechazados} />
      </div>
    </div>
  );
}
