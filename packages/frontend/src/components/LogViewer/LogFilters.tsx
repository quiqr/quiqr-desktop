/**
 * LogFilters - Filter controls for log level, category, and search
 */

import { Box, FormControl, InputLabel, Select, MenuItem, TextField, SelectChangeEvent } from '@mui/material';

interface Props {
  level: string;
  category: string;
  search: string;
  categories: string[];
  onLevelChange: (level: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
}

function LogFilters({
  level,
  category,
  search,
  categories,
  onLevelChange,
  onCategoryChange,
  onSearchChange,
}: Props) {
  const handleLevelChange = (event: SelectChangeEvent) => {
    onLevelChange(event.target.value);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    onCategoryChange(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Log Level</InputLabel>
        <Select value={level} label="Log Level" onChange={handleLevelChange}>
          <MenuItem value="">All Levels</MenuItem>
          <MenuItem value="debug">Debug</MenuItem>
          <MenuItem value="info">Info</MenuItem>
          <MenuItem value="warning">Warning</MenuItem>
          <MenuItem value="error">Error</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Category</InputLabel>
        <Select value={category} label="Category" onChange={handleCategoryChange}>
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        label="Search"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search message or error code..."
        sx={{ flexGrow: 1, minWidth: 250 }}
      />
    </Box>
  );
}

export default LogFilters;
