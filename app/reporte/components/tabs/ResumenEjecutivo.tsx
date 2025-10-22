import AnalisisRiesgoIA from "../cards/AnalisisRiesgoIA";
import KeyInsights from "../cards/KeyInsights";
import CapitalTrabajo from "../cards/CapitalTrabajo";
import KPIsFinancieros from "../cards/KPIsFinancieros";
import EstadoDeudor from "../cards/EstadoDeudor";
import ChequesRechazados from "../cards/ChequesRechazados";
import { EstadosContables, DebtHistory, ChequesRechazados as ChequesRechazadosType } from "../../types";
import { calculateCapitalTrabajo, calculateAllKPIs } from "../../utils/calculations";
import { formatDate } from "../../utils/formatting";

interface ResumenEjecutivoProps {
  estadosContables: EstadosContables;
  deudasHistoria: DebtHistory;
  chequesRechazados: ChequesRechazadosType;
  reportDate: string;
}

export default function ResumenEjecutivo({ estadosContables, deudasHistoria, chequesRechazados, reportDate }: ResumenEjecutivoProps) {
  const capitalTrabajo = calculateCapitalTrabajo(estadosContables);
  const kpis = calculateAllKPIs(estadosContables);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda - 60% */}
      <div className="lg:col-span-7 space-y-6">
        <AnalisisRiesgoIA
          companyName={estadosContables.company_info.company_name}
          periodoCurrent={formatDate(estadosContables.balance_date.$date)}
          periodoAnterior={formatDate(estadosContables.balance_date_previous.$date)}
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
