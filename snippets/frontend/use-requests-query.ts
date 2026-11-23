// Exemplo ilustrativo — não é código de produção.
// Hook de listagem de solicitações com TanStack Query.

import { useQuery, keepPreviousData } from '@tanstack/react-query';

export interface PurchaseRequestSummary {
  id: string;
  title: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  costCenter: string;
  createdAt: string;
}

export interface RequestsListFilters {
  page: number;
  pageSize: number;
  status?: PurchaseRequestSummary['status'];
  search?: string;
}

export interface RequestsListResponse {
  items: PurchaseRequestSummary[];
  total: number;
  page: number;
  pageSize: number;
}

async function fetchRequests(filters: RequestsListFilters): Promise<RequestsListResponse> {
  const queryParams = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.search) queryParams.set('search', filters.search);

  const response = await fetch(`/api/requests?${queryParams.toString()}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar solicitações de compra.');
  }

  return response.json() as Promise<RequestsListResponse>;
}

/** Chave estável para cache e invalidação pós-mutação. */
export const requestsQueryKey = (filters: RequestsListFilters) =>
  ['purchase-requests', filters] as const;

/**
 * Lista paginada com placeholderData para evitar flicker ao trocar de página.
 * A autorização fina permanece na API; este hook só consome o contrato.
 */
export function useRequestsQuery(filters: RequestsListFilters) {
  return useQuery({
    queryKey: requestsQueryKey(filters),
    queryFn: () => fetchRequests(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
