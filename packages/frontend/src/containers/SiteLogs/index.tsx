/**
 * SiteLogs - Container for site-specific workspace logs
 */

import { useParams } from 'react-router';
import { LogViewer } from '../../components/LogViewer';
import * as service from '../../api';

function SiteLogs() {
  const { site, workspace } = useParams<{ site: string; workspace: string }>();

  if (!site || !workspace) {
    return <div>Invalid site or workspace</div>;
  }

  const fetchLogs = async (options: {
    date?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const result = await service.getSiteLogs({
      siteKey: site,
      workspaceKey: workspace,
      ...options,
    });
    return result;
  };

  return (
    <LogViewer 
      title={`Site Logs: ${site} / ${workspace}`}
      fetchLogs={fetchLogs} 
    />
  );
}

export default SiteLogs;
