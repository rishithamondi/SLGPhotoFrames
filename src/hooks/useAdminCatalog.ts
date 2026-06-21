import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, uploadAdminImage, fetchAdminStats, generateProductDetailsAI } from "../lib/api";
import { FetchProductsParams, Product } from "../types/api";

export function useAdminStats(options?: { enabled?: boolean }) {
  const token = localStorage.getItem("admin_token");
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: () => fetchAdminStats(),
    staleTime: 1000 * 10, // 10 seconds stale time
    enabled: !!token && (options?.enabled ?? true),
  });
}

export function useAdminProducts(params?: FetchProductsParams & { status?: string }, options?: { enabled?: boolean }) {
  const token = localStorage.getItem("admin_token");
  return useQuery({
    queryKey: ["adminProducts", params],
    queryFn: () => fetchAdminProducts(params),
    staleTime: 1000 * 30, // 30 seconds stale time for admin
    enabled: !!token && (options?.enabled ?? true),
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: Partial<Product>) => createAdminProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: Partial<Product> }) =>
      updateAdminProduct(id, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permanent }: { id: string; permanent?: boolean }) => deleteAdminProduct(id, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useUploadAdminImage() {
  return useMutation({
    mutationFn: (file: File) => uploadAdminImage(file),
  });
}

export function useGenerateProductDetailsAI() {
  return useMutation({
    mutationFn: (payload: any) => generateProductDetailsAI(payload),
  });
}

