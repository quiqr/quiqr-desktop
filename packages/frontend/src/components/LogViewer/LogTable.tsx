/**
 * LogTable - Table rendering log entries
 */

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import LogRow from './LogRow';
import type { logEntrySchema } from '@quiqr/types';
import { z } from 'zod';

type LogEntry = z.infer<typeof logEntrySchema>;

interface Props {
  entries: LogEntry[];
}

function LogTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No log entries found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Error Code</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry, index) => (
            <LogRow key={`${entry.timestamp}-${index}`} entry={entry} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LogTable;
