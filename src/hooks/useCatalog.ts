import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchProduct, fetchProducts } from "../lib/api";
import { FetchProductsParams } from "../types/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

export function useProducts(params?: FetchProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(slugOrId: string) {
  return useQuery({
    queryKey: ["product", slugOrId],
    queryFn: () => fetchProduct(slugOrId),
    enabled: !!slugOrId,
  });
}
