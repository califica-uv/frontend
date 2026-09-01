"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";

export function useAuth() {
  const query = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    needsUsername: !!query.data && !query.data.username,
    isAdmin: query.data?.role === "admin",
    refetch: query.refetch,
  };
}
