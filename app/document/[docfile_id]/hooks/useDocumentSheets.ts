// app/document/[docfile_id]/hooks/useDocumentSheets.ts

import { useState, useEffect } from "react";

function filterDocumentSheets(doc: any, tab: string) {
  if (tab === "balance_sheet") {
    return (
      doc.pages?.filter(
        (page: any) => page.recognized_info?.is_balance_sheet,
      ) || []
    );
  } else if (tab === "income_statement_sheet") {
    return (
      doc.pages?.filter(
        (page: any) => page.recognized_info?.is_income_statement_sheet,
      ) || []
    );
  } else if (tab === "company_info") {
    // Filtrar páginas que tengan company_info === true
    return doc.pages?.filter((page: any) => page.company_info === true) || [];
  }

  return [];
}

function useDocumentSheets(document: any, activeTab: string) {
  const [documentSheets, setDocumentSheets] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (document) {
      setDocumentSheets(filterDocumentSheets(document, activeTab));
      setCurrentPage(0);
    }
  }, [activeTab, document]);

  return {
    documentSheets,
    currentPage,
    setCurrentPage,
  };
}

export default useDocumentSheets;
