import { useState, useEffect, useCallback } from 'react';
import service from '../../../services/service';
import { Configurations, CommunityTemplate } from '../../../../types';

export function useSiteLibraryData() {
  const [configurations, setConfigurations] = useState<Configurations>({ sites: [] });
  const [quiqrCommunityTemplates, setQuiqrCommunityTemplates] = useState<CommunityTemplate[]>([]);
  const [localsites, setLocalsites] = useState<string[]>([]);
  const [sitesListingView, setSitesListingView] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, _setLoading] = useState(false);

  const updateLocalSites = useCallback(() => {
    const sites: string[] = [];
    service.getConfigurations(true).then((configs) => {
      configs.sites.forEach((site) => {
        sites.push(site.name);
      });

      setLocalsites(sites);
      setConfigurations(configs);
    });
  }, []);

  const updateCommunityTemplates = useCallback(() => {
    service.api
      .updateCommunityTemplates()
      .then(data => {
        setError(null);
        setQuiqrCommunityTemplates(data);
      })
      .catch((e: Error) => {
        setError(e.message);
      });
  }, []);

  useEffect(() => {
    updateLocalSites();
    updateCommunityTemplates();
    service.api.stopHugoServer();

    service.api.readConfPrefKey('sitesListingView').then((view) => {
      if (typeof view === 'string') {
        setSitesListingView(view);
      }
    });
  }, [updateLocalSites, updateCommunityTemplates]);

  return {
    configurations,
    quiqrCommunityTemplates,
    localsites,
    sitesListingView,
    error,
    loading,
    updateLocalSites,
    updateCommunityTemplates
  };
}
