// ruta: app/home/utils/documentHelpers.ts

import { useRouter } from "next/navigation";

export const useHandleSort = (
  sortOrder: "asc" | "desc",
  setSortOrder: (order: "asc" | "desc") => void,
) => {
  return () => {
    const order = sortOrder === "asc" ? "desc" : "asc";

    setSortOrder(order);
  };
};

export const useHandleViewDocument = () => {
  const router = useRouter();

  return (id: string) => {
    router.push(`/document/${id}`);
  };
};
