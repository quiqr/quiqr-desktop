import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import service from '../services/service';

interface FolderPickerProps {
  selectedFolder?: string | null;
  label?: string;
  onFolderSelected: (folder: string | null) => void;
}

function FolderPicker({ selectedFolder, label, onFolderSelected }: FolderPickerProps) {
  const openPicker = async () => {
    try {
      const result = await service.api.showOpenFolderDialog();
      onFolderSelected(result.selectedFolder || null);
    } catch (err) {
      console.error('Error opening folder dialog:', err);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <TextField
        fullWidth
        variant="outlined"
        value={selectedFolder || ''}
        label={label}
        onClick={openPicker}
        slotProps={{ input: { readOnly: true } }}
        style={{ flex: '1 0 500px', flexDirection: 'row' }}
      />
      <Button
        variant="contained"
        onClick={openPicker}
        style={{ flex: '140px 0 0', alignSelf: 'flex-end', marginLeft: '8px', marginBottom: '8px' }}
      >
        Pick Folder
      </Button>
    </div>
  );
}

export default FolderPicker;
