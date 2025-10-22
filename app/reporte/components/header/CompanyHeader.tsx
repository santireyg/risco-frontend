import { Card, CardBody } from "@heroui/card";
import { Tooltip } from "@heroui/tooltip";
import { CompanyInfo } from "../../types";
import { formatCUIT, formatDate } from "../../utils/formatting";
import { Building2, FileText, Calendar, Briefcase } from "lucide-react";

interface CompanyHeaderProps {
  companyInfo: CompanyInfo;
  balanceDate: string;
  balanceDatePrevious: string;
  reportDate: string;
}

export default function CompanyHeader({ companyInfo, balanceDate, balanceDatePrevious, reportDate }: CompanyHeaderProps) {
  return (
    <Card shadow="none">
      <CardBody className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Información principal */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4">
              <Building2 className="w-8 h-8 text-primary mt-1" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyInfo.company_name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <Tooltip content="CUIT de la empresa">
                    <div className="flex items-center gap-1.5 cursor-help">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">CUIT:</span>
                      <span className="font-semibold text-gray-900">{formatCUIT(companyInfo.company_cuit)}</span>
                    </div>
                  </Tooltip>
                  <Tooltip content="Actividad principal de la empresa">
                    <div className="flex items-center gap-1.5 cursor-help">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-medium">Actividad:</span>
                      <span className="text-gray-900">{companyInfo.company_activity}</span>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Información de fechas */}
          <div className="lg:text-right">
            <div className="inline-flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium text-gray-600">Fecha del Reporte:</span>
                <span className="font-semibold text-gray-900">{reportDate}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs text-gray-500 mb-2">Períodos Analizados</div>
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Actual:</span>
                    <span className="font-semibold text-primary">{formatDate(balanceDate)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Anterior:</span>
                    <span className="font-medium text-gray-700">{formatDate(balanceDatePrevious)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
