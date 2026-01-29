/**
 * ApplicationLogs - Container for global application logs
 */

import { LogViewer } from '../../components/LogViewer';
import * as service from '../../api';

function ApplicationLogs() {
  const fetchLogs = async (options: {
    date?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const result = await service.getApplicationLogs(options);
    return result;
  };

  return (
    <LogViewer 
      title="Application Logs" 
      fetchLogs={fetchLogs} 
    />
  );
}

export default ApplicationLogs;
