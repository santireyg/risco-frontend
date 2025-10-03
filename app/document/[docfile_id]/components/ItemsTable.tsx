// ruta: app/document/[docfile_id]/components/ItemsTable.tsx

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
import { Button } from "@heroui/button";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

import styles from "./DocView.module.css";

// Interfaz para cada fila
interface TableRowData {
  concepto: string;
  monto_actual: number;
  monto_anterior: number;
}

interface ItemTableProps {
  data: TableRowData[];
  isEditing: boolean;
  setData: (data: TableRowData[]) => void;
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

const ItemsTable: React.FC<ItemTableProps> = ({ data, isEditing, setData }) => {
  const handleInputChange = (
    index: number,
    field: "concepto" | "monto_actual" | "monto_anterior",
    value: string,
  ) => {
    const updatedData = [...data];

    if (field === "monto_actual" || field === "monto_anterior") {
      updatedData[index][field] = parseFloat(value) || 0;
    } else {
      updatedData[index][field] = value;
    }
    setData(updatedData);
  };

  const handleDeleteRow = (index: number) => {
    const updatedData = data.filter((_, idx) => idx !== index);

    setData(updatedData);
  };

  return (
    <div className="mt-4">
      <Table
        aria-label="Conceptos"
        bottomContent={
          isEditing && (
            <Button
              className="text-foreground-700"
              startContent={<PlusIcon className="h-5 w-5" />}
              variant="light"
              onClick={() => {
                setData([
                  ...data,
                  {
                    concepto: "",
                    monto_actual: 0,
                    monto_anterior: 0,
                  },
                ]);
              }}
            >
              Agregar Ítem
            </Button>
          )
        }
      >
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
          <TableColumn className="text-foreground-500 text-sm font-semibold uppercase text-center">
            {isEditing && "Quitar"}
          </TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className="hover:bg-gray-100"
              style={{
                borderBottom: "0.5px solid #E8E8E8", // Línea delgada
                height: "3rem",
              }}
            >
              <TableCell>
                {isEditing ? (
                  <Input
                    classNames={{
                      inputWrapper: ["bg-transparent", "shadow-none"],
                    }}
                    value={row.concepto}
                    onChange={(e) =>
                      handleInputChange(index, "concepto", e.target.value)
                    }
                  />
                ) : (
                  row.concepto
                )}
              </TableCell>
              <TableCell
                className="text-right"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
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
                    value={row.monto_actual.toString()}
                    onChange={(e) =>
                      handleInputChange(index, "monto_actual", e.target.value)
                    }
                  />
                ) : (
                  formatCurrency(row.monto_actual)
                )}
              </TableCell>
              <TableCell
                className="text-right"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
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
                    value={row.monto_anterior.toString()}
                    onChange={(e) =>
                      handleInputChange(index, "monto_anterior", e.target.value)
                    }
                  />
                ) : (
                  formatCurrency(row.monto_anterior)
                )}
              </TableCell>
              <TableCell className="text-center">
                {isEditing && (
                  <Button
                    isIconOnly
                    radius="full"
                    size="sm"
                    variant="light"
                    onClick={() => handleDeleteRow(index)}
                  >
                    <TrashIcon className="h-5 w-5 text-foreground-400" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
