import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  QueryClient,
} from '@tanstack/react-query';
import service from '../services/service';
import type { API } from '../api';

type ApiMethod = keyof API;
type ApiReturnType<M extends ApiMethod> = Awaited<ReturnType<API[M]>>;
type ApiParams<M extends ApiMethod> = Parameters<API[M]>;
type QueryKey<M extends ApiMethod> = [M, ...ApiParams<M>];

/**
 * Type-safe query hook wrapping service.api methods with React Query.
 */
export function useApiQuery<M extends ApiMethod>(
  method: M,
  params: ApiParams<M>,
  options?: Omit<
    UseQueryOptions<ApiReturnType<M>, Error, ApiReturnType<M>, QueryKey<M>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<ApiReturnType<M>, Error, ApiReturnType<M>, QueryKey<M>>({
    queryKey: [method, ...params] as QueryKey<M>,
    queryFn: async () => {
      const fn = service.api[method] as (...args: ApiParams<M>) => Promise<ApiReturnType<M>>;
      return fn.apply(service.api, params);
    },
    ...options,
  });
}

interface MutationOptions<M extends ApiMethod> {
  invalidateQueries?: ApiMethod[];
  invalidateQueryKeys?: unknown[][];
  onSuccess?: (data: ApiReturnType<M>) => void;
  onError?: (error: Error) => void;
}

/**
 * Type-safe mutation hook with automatic cache invalidation.
 */
export function useApiMutation<M extends ApiMethod>(
  method: M,
  options?: MutationOptions<M>
) {
  const queryClient = useQueryClient();

  return useMutation<ApiReturnType<M>, Error, ApiParams<M>>({
    mutationFn: async (params) => {
      const fn = service.api[method] as (...args: ApiParams<M>) => Promise<ApiReturnType<M>>;
      return fn.apply(service.api, params);
    },
    onSuccess: (data) => {
      options?.invalidateQueries?.forEach((queryMethod) => {
        queryClient.invalidateQueries({ queryKey: [queryMethod] });
      });
      options?.invalidateQueryKeys?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export async function prefetchApiQuery<M extends ApiMethod>(
  queryClient: QueryClient,
  method: M,
  params: ApiParams<M>,
  options?: { staleTime?: number }
) {
  await queryClient.prefetchQuery({
    queryKey: [method, ...params] as QueryKey<M>,
    queryFn: async () => {
      const fn = service.api[method] as (...args: ApiParams<M>) => Promise<ApiReturnType<M>>;
      return fn.apply(service.api, params);
    },
    staleTime: options?.staleTime,
  });
}

export function invalidateApiQueries(
  queryClient: QueryClient,
  method: ApiMethod
) {
  return queryClient.invalidateQueries({ queryKey: [method] });
}

export function setApiQueryData<M extends ApiMethod>(
  queryClient: QueryClient,
  method: M,
  params: ApiParams<M>,
  updater: (old: ApiReturnType<M> | undefined) => ApiReturnType<M>
) {
  return queryClient.setQueryData<ApiReturnType<M>>(
    [method, ...params] as QueryKey<M>,
    updater
  );
}

export function createApiQueryKey<M extends ApiMethod>(
  method: M,
  params: ApiParams<M>
): QueryKey<M> {
  return [method, ...params] as QueryKey<M>;
}

export default useApiQuery;
