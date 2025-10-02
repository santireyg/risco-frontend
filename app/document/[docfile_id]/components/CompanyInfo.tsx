import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";

interface CompanyInfoProps {
  document: any;
  editableDocument: any;
  isEditing: boolean;
  setEditableDocument: (doc: any) => void;
}

// Helper para formatear CUIT con guiones
const formatCuit = (cuit: string) => {
  if (!cuit || cuit.length !== 11) return cuit || "-";

  return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
};

const CompanyInfo: React.FC<CompanyInfoProps> = ({ document: _document, editableDocument, isEditing, setEditableDocument }) => {
  return (
    <Card className="my-7 " shadow="sm">
      <CardHeader className="px-8 py-4 border-b">
        <h2 className="text-lg font-light text-foreground-700">Información de la organización y del archivo</h2>
      </CardHeader>

      <CardBody className="px-8 py-4 text-md">
        {/* Sección: Acerca de la empresa */}
        <div>
          {/* CUIT */}
          <div className="flex flex-col mb-2">
            <p className="text-sm font-medium text-foreground-400 mb-1">CUIT</p>
            {isEditing ? (
              <Tooltip content="Este elemento se edita desde el encabezado">
                <span className="text-foreground-400">{formatCuit(editableDocument.company_info?.company_cuit) || "-"}</span>
              </Tooltip>
            ) : (
              <span className="text-foreground-700">{formatCuit(editableDocument.company_info?.company_cuit) || "-"}</span>
            )}
          </div>

          {/* Nombre de la empresa (razón social) */}
          <div className="flex flex-col mb-2">
            <p className="text-sm font-medium text-foreground-400 mb-1">Razón social</p>
            {isEditing ? (
              <Tooltip content="Este elemento se edita desde la card">
                <span className="text-foreground-400">{editableDocument.company_info?.company_name || "-"}</span>
              </Tooltip>
            ) : (
              <span className="text-foreground-700">{editableDocument.company_info?.company_name || "-"}</span>
            )}
          </div>

          {/* Actividad principal */}
          <div className="flex flex-col mb-2">
            <p className="text-sm font-medium text-foreground-400 mb-1">Actividad principal</p>
            {isEditing ? (
              <Input
                classNames={{
                  inputWrapper: ["shadow-none", "border-1"],
                  input: ["text-white/90"],
                }}
                radius="sm"
                size="sm"
                type="text"
                value={editableDocument.company_info?.company_activity || ""}
                onChange={(e) =>
                  setEditableDocument((prev: any) => ({
                    ...prev,
                    company_info: {
                      ...prev.company_info,
                      company_activity: e.target.value,
                    },
                  }))
                }
              />
            ) : (
              <>
                <span className="text-foreground-700">{editableDocument.company_info?.company_activity || "-"}</span>
              </>
            )}
          </div>

          {/* Domicilio fiscal */}
          <div className="flex flex-col mb-2">
            <p className="text-sm font-medium text-foreground-400 mb-1">Domicilio fiscal</p>
            {isEditing ? (
              <Input
                classNames={{
                  inputWrapper: ["shadow-none", "border-1"],
                  input: ["text-white/90"],
                }}
                radius="sm"
                size="sm"
                type="text"
                value={editableDocument.company_info?.company_address || ""}
                onChange={(e) =>
                  setEditableDocument((prev: any) => ({
                    ...prev,
                    company_info: {
                      ...prev.company_info,
                      company_address: e.target.value,
                    },
                  }))
                }
              />
            ) : (
              <>
                <span className="text-foreground-700">{editableDocument.company_info?.company_address || "-"}</span>
              </>
            )}
          </div>
        </div>

        {/* Sección: Acerca del archivo */}
        <div>
          <div className="flex flex-col mb-2 border-t pt-3 mt-1">
            <p className="text-sm font-medium text-foreground-400 mb-1">Nombre del archivo</p>
            {isEditing ? (
              <Input
                classNames={{
                  inputWrapper: ["shadow-none", "border-1"],
                  input: ["text-white/90"],
                }}
                radius="sm"
                size="sm"
                type="text"
                value={editableDocument.name || ""}
                onChange={(e) =>
                  setEditableDocument((prev: any) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            ) : (
              <>
                <span className="text-foreground-700">{editableDocument.name || "-"}</span>
              </>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CompanyInfo;
