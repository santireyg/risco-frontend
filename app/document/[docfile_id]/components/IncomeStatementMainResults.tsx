// ruta: app/document/[docfile_id]/components/IncomeStatementMainResults.tsx

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";

import styles from "./DocView.module.css";

interface IncomeStatementItem {
  concepto_code: string;
  concepto?: string;
  monto_actual: number;
  monto_anterior: number;
}

interface IncomeStatementMainResultsProps {
  resultadosPrincipales: IncomeStatementItem[];
  isEditing: boolean;
  setResultadosPrincipales: (data: IncomeStatementItem[]) => void;
}

const formatCurrency = (value: number) => {
  const isNegative = value < 0;
  const formattedValue = Math.abs(value)
    .toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\./g, "X")
    .replace(/,/g, ".")
    .replace(/X/g, ",");

  return isNegative ? `( ${formattedValue} ) ` : formattedValue;
};

const IncomeStatementMainResults: React.FC<IncomeStatementMainResultsProps> = ({
  resultadosPrincipales,
  isEditing,
  setResultadosPrincipales,
}) => {
  const handleInputChange = (
    index: number,
    field: "concepto" | "monto_actual" | "monto_anterior",
    value: string,
  ) => {
    const updatedData = [...resultadosPrincipales];

    if (field === "concepto") {
      updatedData[index].concepto = value;
    } else {
      const numericValue = parseFloat(value);

      updatedData[index][field] = isNaN(numericValue) ? 0 : numericValue;
    }

    setResultadosPrincipales(updatedData);
  };

  return (
    <div className="mt-4">
      <Table aria-label="Resultados principales">
        <TableHeader>
          <TableColumn className="text-foreground-500 text-sm font-semibold uppercase">
            Concepto
          </TableColumn>
          <TableColumn className="text-foreground-500 text-sm font-semibold uppercase text-right">
            Actual
          </TableColumn>
          <TableColumn className="text-foreground-500 text-sm font-semibold uppercase text-right">
            Anterior
          </TableColumn>
        </TableHeader>
        <TableBody>
          {resultadosPrincipales.map((item, index) => (
            <TableRow
              key={item.concepto_code}
              className="hover:bg-gray-100"
              style={{
                borderBottom: "0.5px solid #E8E8E8",
                height: "3rem",
              }}
            >
              <TableCell>{item.concepto || item.concepto_code}</TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    classNames={{
                      input: [styles.noSpinners, "text-right"],
                      inputWrapper: ["bg-transparent", "shadow-none"],
                    }}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-300 text-small">$</span>
                      </div>
                    }
                    type="number"
                    value={String(item.monto_actual || 0)}
                    onChange={(e) =>
                      handleInputChange(index, "monto_actual", e.target.value)
                    }
                  />
                ) : (
                  formatCurrency(item.monto_actual)
                )}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <Input
                    classNames={{
                      input: [styles.noSpinners, "text-right"],
                      inputWrapper: ["bg-transparent", "shadow-none"],
                    }}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-300 text-small">$</span>
                      </div>
                    }
                    type="number"
                    value={String(item.monto_anterior || 0)}
                    onChange={(e) =>
                      handleInputChange(index, "monto_anterior", e.target.value)
                    }
                  />
                ) : (
                  formatCurrency(item.monto_anterior)
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default IncomeStatementMainResults;
