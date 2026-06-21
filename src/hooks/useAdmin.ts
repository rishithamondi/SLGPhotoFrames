import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminLogin, fetchAdminMe } from "../lib/api";
import { useEffect, useState } from "react";

export function useAdmin() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));

  // Check if token changes in other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("admin_token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["adminSession", token],
    queryFn: async () => {
      if (!token) return { admin: null };
      try {
        return await fetchAdminMe();
      } catch (err) {
        return { admin: null };
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Automatically clear localStorage and state if the token is invalid/expired
  useEffect(() => {
    if (data && !data.admin && token) {
      localStorage.removeItem("admin_token");
      setToken(null);
      queryClient.removeQueries({ queryKey: ["adminSession"] });
    }
  }, [data, token, queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: Record<string, string>) => adminLogin(email, password),
    onSuccess: (responseData) => {
      localStorage.setItem("admin_token", responseData.token);
      setToken(responseData.token);
      queryClient.setQueryData(["adminSession", responseData.token], { admin: responseData.admin });
    },
  });

  const logout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
    queryClient.removeQueries({ queryKey: ["adminSession"] });
  };

  return {
    admin: data?.admin || null,
    isAuthenticated: !!data?.admin,
    isLoading: isLoading && !!token,
    error: null,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? (loginMutation.error as Error).message : null,
    logout,
  };
}
