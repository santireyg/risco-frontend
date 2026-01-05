"use client";

import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { FinancialDetailItem } from "../../../types";
import { formatMoneyInt, formatPercentInt } from "../../../utils/chart-formatting";

interface IncomeStatementTableProps {
  items: FinancialDetailItem[];
  maxHeight?: number;
}

export default function IncomeStatementTable({
  items,
  maxHeight = 300,
}: IncomeStatementTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only offer expansion if items list is actually quite long to justify scrolling hidden
  const needsExpansion = items.length > 8; 

  return (
    <div className="w-full relative shadow-sm rounded-lg border border-gray-100 overflow-hidden">
    {/* // <div className=""> */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden relative ${isExpanded || !needsExpansion ? '' : 'max-h-[300px]'}`}
      >
        <div className={`overflow-auto ${isExpanded || !needsExpansion ? '' : 'max-h-[300px] scrollbar-hide'}`}>
         <Table 
            radius="lg"
            aria-label="Financial Details" 
            className="min-w-full" 
            shadow="none"
            removeWrapper
            classNames={{
                td: "text-gray-900 border-b border-gray-100 text-sm py-3 group-hover:bg-gray-100/50 transition-colors",
                tr: "group cursor-default",
            }}
        >
            <TableHeader>
            <TableColumn>CONCEPTO</TableColumn>
            <TableColumn className="text-right">2024</TableColumn>
            <TableColumn className="text-right">2023</TableColumn>
            <TableColumn className="text-right">VAR. %</TableColumn>
            </TableHeader>
            <TableBody>
            {items.map((item, index) => {
                const diff = item.monto_periodo_actual - item.monto_periodo_anterior;
                const varPt = item.monto_periodo_anterior !== 0 
                    ? (diff / Math.abs(item.monto_periodo_anterior)) * 100 
                    : 0;

                return (
                <TableRow key={index}>
                    <TableCell className="max-w-[200px] truncate" title={item.concepto}>{item.concepto}</TableCell>
                    <TableCell className="text-right tabular-nums text-gray-700">{formatMoneyInt(item.monto_periodo_actual)}</TableCell>
                    <TableCell className="text-right tabular-nums text-gray-500">{formatMoneyInt(item.monto_periodo_anterior)}</TableCell>
                    <TableCell className="text-right">
                        {item.monto_periodo_anterior !== 0 ? (
                             <div className="flex justify-end">
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    {varPt > 0 ? "+" : ""}{formatPercentInt(varPt)}
                                </span>
                             </div>
                        ) : (
                            <span className="text-gray-300">-</span>
                        )}
                    </TableCell>
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
        </div>
      </div>
        
      {needsExpansion && (
        <div 
            className={`
                w-full flex justify-center py-2 z-10
                ${isExpanded ? 'bg-white border-t border-gray-100 relative' : 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-12 text-blue-500'}
            `}
        >
             <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 focus:outline-none bg-white shadow-sm border border-gray-100"
             >
                {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
             </button>
        </div>
      )}
    </div>
  );
}
