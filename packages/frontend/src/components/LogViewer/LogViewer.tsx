/**
 * LogViewer - Main log display component with filtering and pagination
 */

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Pagination } from '@mui/material';
import LogFilters from './LogFilters';
import LogTable from './LogTable';
import type { logEntrySchema } from '@quiqr/types';
import { z } from 'zod';

type LogEntry = z.infer<typeof logEntrySchema>;

interface Props {
  title: string;
  fetchLogs: (options: {
    date?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{
    entries: LogEntry[];
    total: number;
    hasMore: boolean;
  }>;
}

function LogViewer({ title, fetchLogs }: Props) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pageSize = 100;

  // Load logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchLogs({
        level: level as 'debug' | 'info' | 'warning' | 'error' | undefined,
        category: category || undefined,
        search: search || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      setEntries(result.entries);
      setTotal(result.total);
      
      // On initial load, jump to the last page
      if (isInitialLoad && result.total > 0) {
        const lastPage = Math.ceil(result.total / pageSize);
        if (lastPage > 1) {
          setPage(lastPage);
        }
        setIsInitialLoad(false);
      }

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(result.entries.map((entry) => entry.category))
      ).sort();
      
      setCategories((prevCategories) => {
        const allCategories = Array.from(new Set([...prevCategories, ...uniqueCategories])).sort();
        return allCategories;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  // Load logs when filters or page changes
  useEffect(() => {
    loadLogs();
  }, [level, category, search, page]);

  // Reset to page 1 when filters change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      setPage(1);
    }
  }, [level, category, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      <LogFilters
        level={level}
        category={category}
        search={search}
        categories={categories}
        onLevelChange={setLevel}
        onCategoryChange={setCategory}
        onSearchChange={setSearch}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && <LogTable entries={entries} />}

      {!loading && !error && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {!loading && !error && total > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total} entries
        </Typography>
      )}
    </Box>
  );
}

export default LogViewer;
