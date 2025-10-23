import { Card, CardBody } from "@heroui/card";
import { FileText } from "lucide-react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { CompanyInfo } from "../../types";
import { formatCUIT } from "../../utils/formatting";

const formatDateDDMMYYYY = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

interface CompanyHeaderProps {
  companyInfo: CompanyInfo;
  balanceDate: string;
  balanceDatePrevious: string;
  reportDate: string;
}

export default function CompanyHeader({ companyInfo, balanceDate, balanceDatePrevious, reportDate }: CompanyHeaderProps) {
  return (
    <Card shadow="none" radius="none" className="border-none bg-transparent">
      <CardBody className="px-0 pb-8 pt-0">
        <div className="flex flex-col gap-6 border-gray-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center  sm:gap-3">
                <div className="flex shadow-sm h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200">
                  <HiOutlineBuildingOffice2 className="h-7 w-7 text-slate-500" />
                </div>
                <h1 className="text-4xl font leading-tight text-slate-900">{companyInfo.company_name}</h1>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.10em] text-slate-400">CUIT:</span>
                  <span className="text-slate-500 font-light">{formatCUIT(companyInfo.company_cuit)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.10em] text-slate-400">Actividad:</span>
                  <span className="text-slate-500 font-light">{companyInfo.company_activity}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="inline-flex flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm text-sm text-slate-600 sm:flex-row">
                <div className="flex items-center bg-slate-100 px-4 text-xs font-medium text-slate-600">Fecha del reporte</div>
                <div className="flex items-center bg-white gap-2 border-t border-slate-200 px-4 py-2 text-slate-500 sm:border-t-0 sm:border-l sm:border-gray-200">
                  <span className="text-xs">{reportDate}</span>
                </div>
              </div>

              <div className="inline-flex flex-col overflow-hidden rounded-md border border-slate-200 shadow-sm text-sm text-slate-600 sm:flex-row">
                <div className="flex items-center bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">Balance</div>
                <div className="flex items-center bg-white gap-2 border-t border-slate-200 px-4 py-2 text-xs text-slate-500 sm:border-t-0 sm:border-l sm:border-gray-200">
                  <span>Período actual:</span>
                  <span>{formatDateDDMMYYYY(balanceDate)}</span>
                </div>
                <div className="flex items-center bg-white gap-2 border-t border-slate-200 px-4 py-2 text-xs text-slate-500 sm:border-t-0 sm:border-l sm:border-gray-200">
                  <span>Período anterior:</span>
                  <span>{formatDateDDMMYYYY(balanceDatePrevious)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
