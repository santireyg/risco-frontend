"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import { Skeleton } from "@heroui/skeleton";
import {
  FiSearch,
  FiPlus,
  FiChevronDown,
  FiTrash2,
  FiRotateCcw,
} from "react-icons/fi";
import { TbEyeEdit } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { ToastProvider, addToast } from "@heroui/toast";
import { Tooltip } from "@heroui/tooltip";

import { useDocuments } from "../hooks/useDocuments";
import { useDebounce } from "../hooks/useDebounce";
import { useMinimumLoading } from "../hooks/useMinimumLoading";
import { api } from "../../lib/apiClient";

import { useWebSocket } from "@/app/context/WebSocketContext";
import StatusChip from "@/components/StatusChip";
import ValidationChip from "@/components/ValidationChip";
import ProcessingChip from "@/components/ProcessingChip";
import { useAuth } from "@/app/context/AuthContext";

// Definición de columnas
const columns = [
  { name: "Razón social", uid: "company_name", sortable: true },
  { name: "CUIT", uid: "company_cuit", sortable: true },
  { name: "Autor", uid: "uploaded_by", sortable: true },
  { name: "Archivo", uid: "name", sortable: true },
  { name: "Carga", uid: "upload_date", sortable: true },
  { name: "Balance", uid: "balance_date", sortable: true },
  { name: "Métricas", uid: "processing", sortable: false },
  { name: "Estado", uid: "status", sortable: true },
  { name: "Validación", uid: "validation", sortable: true },
  { name: "Acciones", uid: "actions" },
];

const tableColumns = columns.map((col) => ({
  key: col.uid,
  label: col.name,
  sortable: col.sortable,
}));

// Opciones para el filtro de Validación
const validationOptions = [
  { name: "Todos", value: "all" },
  { name: "Sin datos", value: "Sin datos" },
  { name: "Advertencia", value: "Advertencia" },
  { name: "Validado", value: "Validado" },
];

const LOCAL_STORAGE_KEY = "documentsTableState";

function getInitialTableState() {
  if (typeof window === "undefined") return null;
  const saved = sessionStorage.getItem(LOCAL_STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      // visibleColumns debe ser Set si no es "all"
      if (parsed.visibleColumns && parsed.visibleColumns !== "all") {
        parsed.visibleColumns = new Set(parsed.visibleColumns);
      }

      return parsed;
    } catch {}
  }

  return null;
}

const DEFAULT_STATE = {
  searchQuery: "",
  validationFilter: "all",
  sortDescriptor: { column: "upload_date", direction: "descending" as const },
  page: 1,
  rowsPerPage: 7,
  visibleColumns: new Set(
    tableColumns.map((col) => col.key).filter((key) => key !== "name"),
  ),
};

const DocumentsTable: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();

  // Hook para detectar el tamaño de pantalla
  const [is2xlScreen, setIs2xlScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIs2xlScreen(window.innerWidth >= 1536); // 2xl breakpoint en Tailwind
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Estado inicial desde sessionStorage
  const initialState = getInitialTableState() || {};
  const [searchQuery, setSearchQuery] = useState<string>(
    initialState.searchQuery ?? "",
  );
  const [validationFilter, setValidationFilter] = useState<string>(
    initialState.validationFilter ?? "all",
  );
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>(
    initialState.sortDescriptor ?? {
      column: "upload_date",
      direction: "descending",
    },
  );
  const [page, setPage] = useState<number>(initialState.page ?? 1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(
    initialState.rowsPerPage ?? 7,
  );
  const [visibleColumns, setVisibleColumns] = useState<"all" | Set<string>>(
    initialState.visibleColumns ??
      new Set(
        tableColumns.map((col) => col.key).filter((key) => key !== "name"),
      ),
  );
  const [storedTotalPages, setStoredTotalPages] = useState<number>(1);
  const [storedTotalDocs, setStoredTotalDocs] = useState<number>(0);

  // Debounce para el buscador
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Obtención de documentos desde la API (sin filtro de status)
  const { data, loading, revalidate } = useDocuments({
    q: debouncedSearchQuery,
    sort_field: sortDescriptor.column,
    sort_order: sortDescriptor.direction === "ascending" ? "asc" : "desc",
    page,
    page_size: rowsPerPage,
    validation_status:
      validationFilter !== "all" ? validationFilter : undefined, // <-- Pasar filtro a la API
  });

  // Hook para mantener un mínimo de tiempo en el estado de carga
  const displayLoading = useMinimumLoading(loading, 300);

  // Actualizamos storedTotalPages cuando los datos cambian y la carga termina
  useEffect(() => {
    if (!loading && data?.total_pages) {
      setStoredTotalPages(data.total_pages);
    }
  }, [loading, data?.total_pages]);

  // Actualizamos storedTotalDocs cuando los datos cambian y la carga termina
  useEffect(() => {
    if (!loading && data?.total !== undefined) {
      setStoredTotalDocs(data.total);
    }
  }, [loading, data?.total]);

  // Transformamos los documentos para la tabla
  const tableItems = useMemo(() => {
    const items = data?.items || [];

    return items.map((item: any, index: number) => ({
      ...item,
      key: item.id || item._id || index.toString(),
    }));
  }, [data]);

  // Actualizaciones vía WebSocket
  const { docUpdates } = useWebSocket();

  const mergedItems = useMemo(() => {
    return tableItems.map((item: any) => {
      const docId = item.id || item._id;
      const update = docUpdates[docId];
      // Merge company_info from websocket or API
      const companyInfo = update?.company_info || item.company_info || {};

      return {
        ...item,
        status: update?.status || item.status,
        progress:
          update?.progress !== undefined ? update.progress : item.progress,
        upload_date: update?.upload_date || item.upload_date,
        balance_date: update?.balance_date || item.balance_date,
        validation: update?.validation || item.validation,
        ai_report: update?.ai_report || item.ai_report,
        error_message: update?.error_message || item.error_message,
        company_info: companyInfo,
        company_name: companyInfo.company_name || "",
        company_cuit: companyInfo.company_cuit || "",
        page_count:
          update?.page_count !== undefined
            ? update.page_count
            : item.page_count,
        processing_time: update?.processing_time || item.processing_time,
      };
    });
  }, [tableItems, docUpdates]);

  // Filtrar por validación y por eliminados
  // El filtrado de validación ahora lo hace la API, así que solo devolvemos mergedItems
  const filteredItems = useMemo(() => mergedItems, [mergedItems]);

  // Funciones de paginación
  const onNextPage = useCallback(() => {
    if (page < storedTotalPages) setPage(page + 1);
  }, [page, storedTotalPages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) setPage(page - 1);
  }, [page]);

  // Función para eliminar un documento
  const handleDelete = async (docId: string) => {
    const confirmed = window.confirm(
      "¿Deseas eliminar este documento de forma permanente? Esta acción no se puede deshacer.",
    );

    if (!confirmed) return;
    try {
      await api.delete<{ message: string }>(`document/${docId}`);
      addToast({
        title: "Documento eliminado",
        description: "El documento se eliminó correctamente.",
        color: "success",
      });
      // Actualizamos la tabla revalidando los datos
      revalidate();
    } catch (err: any) {
      addToast({
        title: "Error al eliminar",
        description: err?.message ?? "No se pudo eliminar el documento.",
        color: "danger",
      });
    }
  };

  // Manejadores de cambios
  const handleSortChange = (column: string) => {
    setSortDescriptor((prev) => {
      if (column === prev.column) {
        return {
          column,
          direction:
            prev.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return {
          column,
          direction: "ascending",
        };
      }
    });
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleValidationChange = (newFilter: string) => {
    setValidationFilter(newFilter);
    setPage(1);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  // Función para comparar el estado actual con el default
  const isDefaultState = useMemo(() => {
    return (
      searchQuery === DEFAULT_STATE.searchQuery &&
      validationFilter === DEFAULT_STATE.validationFilter &&
      sortDescriptor.column === DEFAULT_STATE.sortDescriptor.column &&
      sortDescriptor.direction === DEFAULT_STATE.sortDescriptor.direction &&
      page === DEFAULT_STATE.page &&
      rowsPerPage === DEFAULT_STATE.rowsPerPage &&
      visibleColumns instanceof Set &&
      DEFAULT_STATE.visibleColumns instanceof Set &&
      visibleColumns.size === DEFAULT_STATE.visibleColumns.size &&
      Array.from(visibleColumns).every((v) =>
        DEFAULT_STATE.visibleColumns.has(v),
      )
    );
  }, [
    searchQuery,
    validationFilter,
    sortDescriptor,
    page,
    rowsPerPage,
    visibleColumns,
  ]);

  // Función para resetear todo
  const handleReset = () => {
    setSearchQuery(DEFAULT_STATE.searchQuery);
    setValidationFilter(DEFAULT_STATE.validationFilter);
    setSortDescriptor({ ...DEFAULT_STATE.sortDescriptor });
    setPage(DEFAULT_STATE.page);
    setRowsPerPage(DEFAULT_STATE.rowsPerPage);
    setVisibleColumns(
      new Set(
        tableColumns.map((col) => col.key).filter((key) => key !== "name"),
      ),
    );
    sessionStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Constante para truncar el nombre de archivo
  const FILE_NAME_TRUNCATE_LENGTH = 25;

  // Formatea el CUIT como XX-XXXXXXXX-X
  function formatCuit(cuit: string): string {
    if (!cuit) return "-";
    const digits = cuit.replace(/[^0-9]/g, "");

    if (digits.length !== 11) return cuit;

    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
  }

  // Capitaliza la inicial de cada palabra o después de un punto
  function capitalizeCompanyName(name: string): string {
    if (!name) return "-";

    return name
      .toLowerCase()
      .replace(/(^|[\.\s])([a-záéíóúüñ])/g, (match) => match.toUpperCase());
  }

  // Renderizamos cada celda según la columna
  const renderCell = useCallback(
    (item: any, columnKey: React.Key) => {
      switch (columnKey) {
        case "company_name": {
          // Si no hay nombre de empresa, usar el nombre de archivo
          let name = item.company_info?.company_name;

          if (!name || name.trim() === "") {
            name = item.name || "-";
          }

          return <TableCell>{capitalizeCompanyName(name)}</TableCell>;
        }
        case "company_cuit": {
          const cuit = item.company_info?.company_cuit || "-";

          return <TableCell>{formatCuit(cuit)}</TableCell>;
        }
        case "name": {
          const fileName = item.name || "-";
          const truncated =
            fileName.length > FILE_NAME_TRUNCATE_LENGTH
              ? fileName.slice(0, FILE_NAME_TRUNCATE_LENGTH) + "..."
              : fileName;

          return fileName.length > FILE_NAME_TRUNCATE_LENGTH ? (
            <TableCell className="text-xs text-slate-400 2xl:text-sm">
              <Tooltip content={fileName}>
                <span>{truncated}</span>
              </Tooltip>
            </TableCell>
          ) : (
            <TableCell>{truncated}</TableCell>
          );
        }
        case "uploaded_by":
          return (
            <TableCell className="text-xs text-slate-400 2xl:text-sm">
              {item.uploaded_by}
            </TableCell>
          );
        case "status":
          return (
            <TableCell className="text-center">
              <StatusChip
                errorMessage={item.error_message}
                progress={item.progress}
                status={item.status}
              />
            </TableCell>
          );
        case "upload_date":
          return (
            <TableCell className="text-xs text-slate-400 2xl:text-sm text-center">
              {item.upload_date
                ? new Date(item.upload_date).toLocaleDateString()
                : "-"}
            </TableCell>
          );
        case "balance_date":
          return (
            <TableCell className="text-xs text-slate-400 2xl:text-sm text-center">
              {item.balance_date
                ? new Date(item.balance_date).toLocaleDateString()
                : "-"}
            </TableCell>
          );
        case "validation":
          return (
            <TableCell className="text-center">
              {item.validation ? (
                <ValidationChip
                  message={item.validation.message}
                  progress={item.validation.progress}
                  status={item.validation.status ?? "no disponible"}
                />
              ) : (
                <ValidationChip status="no disponible" />
              )}
            </TableCell>
          );
        case "processing":
          return (
            <TableCell className="text-center">
              <ProcessingChip
                pageCount={item.page_count}
                processingTime={item.processing_time}
              />
            </TableCell>
          );
        case "actions":
          return (
            <TableCell>
              <div className="flex gap-2 justify-center">
                <Tooltip content="Revisar documento">
                  <Button
                    isIconOnly
                    color="primary"
                    radius="md"
                    size="sm"
                    variant="flat"
                    onPress={() =>
                      router.push(`/document/${item.id || item._id}`)
                    }
                  >
                    <TbEyeEdit className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Eliminar documento">
                  <Button
                    isIconOnly
                    className="border"
                    color="default"
                    radius="md"
                    size="sm"
                    variant="ghost"
                    onPress={() => handleDelete(item.id || item._id)}
                  >
                    <FiTrash2 className="h-4 w-4 text-gray-400" />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          );
        default:
          return <TableCell>{item[String(columnKey)]}</TableCell>;
      }
    },
    [router],
  );

  // Anchos de columna responsivos
  const headerWidths: Record<string, string> = useMemo(() => {
    if (is2xlScreen) {
      // Anchos para pantallas 2xl (1536px+)
      return {
        company_name: "300px",
        company_cuit: "130px",
        uploaded_by: "250px",
        name: "200px",
        status: "130px",
        processing: "140px",
        upload_date: "120px",
        balance_date: "120px",
        validation: "130px",
        actions: "120px",
      };
    } else {
      // Anchos para pantallas xl y menores (hasta 1535px)
      return {
        company_name: "245px",
        company_cuit: "130px",
        uploaded_by: "145px",
        name: "125px",
        status: "135px",
        processing: "110px",
        upload_date: "95px",
        balance_date: "95px",
        validation: "120px",
        actions: "90px",
      };
    }
  }, [is2xlScreen]);

  // Filas skeleton según filas por página
  const skeletonRows = useMemo(() => {
    return Array.from({ length: rowsPerPage });
  }, [rowsPerPage]);

  // Contenido superior: barra de búsqueda y controles (ajustado para disposición horizontal en desktop)
  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[50%]"
            classNames={{ inputWrapper: "bg-white" }}
            placeholder="Buscar por CUIT, Razón social, Nombre de archivo o Autor..."
            size="md"
            startContent={<FiSearch />}
            value={searchQuery}
            variant="bordered"
            onChange={handleSearchChange}
            onClear={() => setSearchQuery("")}
          />

          {/* Controles y botón: ocupan toda la fila en mobile, horizontal en md+ */}
          <div className="flex gap-3 items-end">
            {/* Botón Reset a la izquierda del selector de Estado de validación */}
            <Tooltip
              closeDelay={0}
              content="Reinicia los filtros y opciones"
              delay={0}
            >
              <Button
                isIconOnly
                className="mr-1 mb-1 "
                color="default"
                isDisabled={isDefaultState}
                radius="full"
                size="sm"
                variant="bordered"
                onPress={handleReset}
              >
                <FiRotateCcw className="h-3 w-3 text-slate-500" />
              </Button>
            </Tooltip>
            <div className="text-xs text-gray-400">
              <span className="hidden sm:flex mb-1 block">
                Estado de validación
              </span>
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button
                    className="min-w-[140px]"
                    id="validation-dropdown"
                    size="md"
                    variant="bordered"
                  >
                    {validationOptions.find(
                      (opt) => opt.value === validationFilter,
                    )?.name || "Seleccionar"}{" "}
                    <FiChevronDown className="ml-1" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Estado de validación"
                  disallowEmptySelection={false}
                  selectedKeys={[validationFilter]}
                  selectionMode="single"
                  onSelectionChange={(keys) => {
                    const key = Array.from(keys)[0] as string;

                    handleValidationChange(key);
                  }}
                >
                  {validationOptions.map((option) => (
                    <DropdownItem key={option.value}>
                      {option.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
            <div className="text-xs text-gray-400">
              <span className="hidden sm:flex mb-1 block">
                Modificar columnas
              </span>
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button
                    className="min-w-[140px]"
                    size="md"
                    variant="bordered"
                  >
                    Columnas <FiChevronDown className="ml-1" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={(keys) =>
                    setVisibleColumns(keys as Set<string>)
                  }
                >
                  {tableColumns.map((column) => (
                    <DropdownItem key={column.key}>{column.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
            <Button
              color="primary"
              size="md"
              variant="flat"
              onPress={() => router.push("/upload")}
            >
              <FiPlus className="mr-1" />
              Nuevo Documento
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Total {storedTotalDocs} documentos
          </span>
          <label
            className="flex items-center text-sm text-gray-500"
            htmlFor="rows-per-page-select"
          >
            Filas por página:
            <select
              className="ml-2 bg-transparent outline-none"
              id="rows-per-page-select"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="7">7</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    ),
    [
      searchQuery,
      validationFilter,
      rowsPerPage,
      storedTotalDocs,
      visibleColumns,
      router,
      isDefaultState,
    ],
  );

  // Contenido inferior: paginación
  const bottomContent = useMemo(() => {
    if (loading || storedTotalPages === 0) return null;

    return (
      <div className="mt-5 px-2 flex items-center">
        <span className="text-sm text-gray-500">
          Página {page} de {storedTotalPages}
        </span>
        <div className="flex-grow flex justify-center">
          <Pagination
            key={`pagination-${page}-${storedTotalPages}`}
            isCompact
            showControls
            classNames={{ wrapper: "bg-white border" }}
            color="primary"
            page={page}
            total={storedTotalPages}
            variant="light"
            onChange={(newPage: number) => setPage(newPage)}
          />
        </div>
        <div className="hidden sm:flex gap-2">
          <Button
            className="border bg-white"
            isDisabled={page === 1}
            radius="md"
            size="sm"
            variant="ghost"
            onPress={onPreviousPage}
          >
            Anterior
          </Button>
          <Button
            className="border bg-white"
            isDisabled={page === storedTotalPages}
            radius="md"
            size="sm"
            variant="ghost"
            onPress={onNextPage}
          >
            Siguiente
          </Button>
        </div>
      </div>
    );
  }, [loading, page, storedTotalPages, onNextPage, onPreviousPage]);

  // Guardar estado relevante en sessionStorage al cambiar
  useEffect(() => {
    let visibleColumnsToStore: any = visibleColumns;

    if (visibleColumns instanceof Set) {
      visibleColumnsToStore = Array.from(visibleColumns);
    }
    const state = {
      searchQuery,
      validationFilter,
      sortDescriptor,
      page,
      rowsPerPage,
      visibleColumns: visibleColumnsToStore,
    };

    sessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [
    searchQuery,
    validationFilter,
    sortDescriptor,
    page,
    rowsPerPage,
    visibleColumns,
  ]);

  // Limpiar sessionStorage al cerrar sesión
  useEffect(() => {
    // Monkey patch logout para limpiar sessionStorage
    const originalLogout = logout;
    const wrappedLogout = async () => {
      sessionStorage.removeItem(LOCAL_STORAGE_KEY);
      await originalLogout();
    };

    // @ts-ignore
    (window as any).logoutWithSessionCleanup = wrappedLogout;

    return () => {
      // Limpieza opcional
      // @ts-ignore
      delete (window as any).logoutWithSessionCleanup;
    };
  }, [logout]);

  // Limpiar sessionStorage al cerrar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <ToastProvider
        placement="bottom-center"
        toastProps={{ timeout: 10000, variant: "flat" }}
      />
      {topContent}
      <div className="rounded-2xl shadow-sm overflow-hidden border">
        <Table
          isHeaderSticky
          aria-label="Tabla de documentos"
          isVirtualized={true}
          layout="fixed"
          maxTableHeight={rowsPerPage > 10 ? 600 : 420}
          radius="none"
          rowHeight={48}
          shadow="none"
          sortDescriptor={sortDescriptor}
          onSortChange={({ column, direction: _direction }) =>
            handleSortChange(String(column))
          }
          // isCompact
        >
          <TableHeader
            columns={tableColumns.filter((col) =>
              visibleColumns === "all"
                ? true
                : (visibleColumns as Set<string>).has(col.key),
            )}
          >
            {(column) => {
              const widthClass = headerWidths[column.key];
              const centerAlignColumns = [
                "actions",
                "upload_date",
                "balance_date",
                "status",
                "validation",
              ];

              return (
                <TableColumn
                  key={column.key}
                  align={
                    centerAlignColumns.includes(column.key) ? "center" : "start"
                  }
                  allowsSorting={column.sortable}
                  width={widthClass as any}
                >
                  {column.label.toUpperCase()}
                </TableColumn>
              );
            }}
          </TableHeader>
          <TableBody emptyContent="No se encontraron documentos.">
            {displayLoading
              ? skeletonRows.map((_, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-100 h-[48px]">
                    {tableColumns
                      .filter((col) =>
                        visibleColumns === "all"
                          ? true
                          : (visibleColumns as Set<string>).has(col.key),
                      )
                      .map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton className="rounded-lg" isLoaded={false}>
                            <div className="h-3 rounded-lg bg-default-300" />
                          </Skeleton>
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              : filteredItems.map((item) => (
                  <TableRow key={item.key} className="hover:bg-gray-100">
                    {(columnKey) => renderCell(item, columnKey)}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      {bottomContent} {/* El paginador ahora está fuera de la tabla */}
    </>
  );
};

export default DocumentsTable;
