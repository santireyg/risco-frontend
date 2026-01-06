import { Card, CardBody } from "@heroui/card";
import { FileX, AlertTriangle, DollarSign, Clock } from "lucide-react";

import { ChequesRechazados as ChequesRechazadosType } from "../../../types";
import { formatCurrency } from "../../../utils/formatting";

interface ChequesRechazadosProps {
  data: ChequesRechazadosType;
}

export default function ChequesRechazados({ data }: ChequesRechazadosProps) {
  // Extraer todos los cheques
  const todosCheques = data.results.causales.flatMap((causal) =>
    causal.entidades.flatMap((entidad) => entidad.detalle),
  );

  // Cantidad total
  const cantidadTotal = todosCheques.length;

  // Cheques impagos (sin fechaPago o fecha futura)
  const chequesImpagos = todosCheques.filter(
    (cheque) => !cheque.fechaPago || new Date(cheque.fechaPago) > new Date(),
  );
  const cantidadImpagos = chequesImpagos.length;

  // Monto total
  const montoTotal = todosCheques.reduce(
    (sum, cheque) => sum + cheque.monto,
    0,
  );

  // Monto impagos
  const montoImpagos = chequesImpagos.reduce(
    (sum, cheque) => sum + cheque.monto,
    0,
  );

  return (
    <Card
      className="border border-slate-200 shadow-sm"
      radius="sm"
      shadow="none"
    >
      <CardBody className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileX className="w-5 h-5 text-danger" />
          <h3 className="text-xl font-bold text-gray-900">
            Cheques Rechazados
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileX className="w-4 h-4 text-gray-600" />
              <div className="text-xs text-gray-600">Total Rechazados</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {cantidadTotal}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${cantidadImpagos > 0 ? "bg-danger/10" : "bg-gray-50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <div className="text-xs text-gray-600">Pendientes Pago</div>
            </div>
            <div
              className={`text-2xl font-bold ${cantidadImpagos > 0 ? "text-danger" : "text-gray-900"}`}
            >
              {cantidadImpagos}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <div className="text-xs text-gray-600">Monto Total</div>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(montoTotal)}
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${montoImpagos > 0 ? "bg-danger/10" : "bg-gray-50"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-gray-600" />
              <div className="text-xs text-gray-600">Monto Impagos</div>
            </div>
            <div
              className={`text-lg font-bold ${montoImpagos > 0 ? "text-danger" : "text-gray-900"}`}
            >
              {formatCurrency(montoImpagos)}
            </div>
          </div>
        </div>

        {cantidadImpagos > 0 && (
          <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-danger mt-0.5 flex-shrink-0" />
              <p className="text-xs text-danger">
                <strong>Alerta:</strong> Se detectaron cheques pendientes de
                pago. Esto representa un riesgo crediticio significativo.
              </p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
