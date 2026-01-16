import { useState, useEffect, useRef } from 'react';
import { getConfigurations, listWorkspaces, getWorkspaceDetails } from '../api';
import { serviceSchemas, Configurations, SiteAndWorkspaceData, WorkspaceDetails } from '../../types';
import { validateServiceResponse } from '../utils/validation';

export function useConfigurations(refetch?: boolean) {
  const [data, setData] = useState<Configurations | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const promiseRef = useRef<Promise<Configurations> | undefined>(undefined);
  const refetchTriggerRef = useRef(refetch);

  useEffect(() => {
    refetchTriggerRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!data || refetch === true) {
      if (!promiseRef.current) {
        setLoading(true);
        setError(undefined);

        promiseRef.current = getConfigurations({ invalidateCache: refetch || false })
          .then((configurations) => {
            const validated = validateServiceResponse(
              'getConfigurations',
              serviceSchemas.getConfigurations,
              configurations
            );
            setData(validated);
            setLoading(false);
            promiseRef.current = undefined;
            return validated;
          })
          .catch((err) => {
            setError(err);
            setLoading(false);
            promiseRef.current = undefined;
            throw err;
          });
      }
    } else if (data) {
      setLoading(false);
    }
  }, [data, refetch]);

  return { data, loading, error };
}

export function useSiteAndWorkspaceData(siteKey: string, workspaceKey: string) {
  const [data, setData] = useState<SiteAndWorkspaceData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const promiseRef = useRef<Promise<SiteAndWorkspaceData> | undefined>(undefined);
  const keysRef = useRef({ siteKey, workspaceKey });

  useEffect(() => {
    if (keysRef.current.siteKey !== siteKey || keysRef.current.workspaceKey !== workspaceKey) {
      keysRef.current = { siteKey, workspaceKey };
      setData(undefined);
      promiseRef.current = undefined;
    }
  }, [siteKey, workspaceKey]);

  useEffect(() => {
    if (!promiseRef.current) {
      setLoading(true);
      setError(undefined);

      const bundle: Partial<SiteAndWorkspaceData> = {};

      promiseRef.current = getConfigurations({ invalidateCache: false })
        .then((configurations) => {
          const validatedConfigs = validateServiceResponse(
            'getConfigurations',
            serviceSchemas.getConfigurations,
            configurations
          );
          bundle.configurations = validatedConfigs;
          bundle.site = validatedConfigs.sites.find(site => site.key === siteKey);
          return listWorkspaces(siteKey);
        })
        .then((workspaces) => {
          bundle.siteWorkspaces = workspaces;
          bundle.workspace = workspaces.find((workspace) => workspace.key === workspaceKey);
          return getWorkspaceDetails(siteKey, workspaceKey);
        })
        .then((workspaceDetails) => {
          bundle.workspaceDetails = workspaceDetails;

          const validated = validateServiceResponse(
            'getSiteAndWorkspaceData',
            serviceSchemas.getSiteAndWorkspaceData,
            bundle
          );

          setData(validated);
          setLoading(false);
          promiseRef.current = undefined;
          return validated;
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
          promiseRef.current = undefined;
          throw err;
        });
    }
  }, [siteKey, workspaceKey]);

  return { data, loading, error };
}

export function useWorkspaceDetails(siteKey: string, workspaceKey: string) {
  const [data, setData] = useState<WorkspaceDetails | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    setError(undefined);

    getWorkspaceDetails(siteKey, workspaceKey)
      .then((details) => {
        const validated = validateServiceResponse(
          'getWorkspaceDetails',
          serviceSchemas.getWorkspaceDetails,
          details
        );
        setData(validated);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [siteKey, workspaceKey]);

  return { data, loading, error };
}
