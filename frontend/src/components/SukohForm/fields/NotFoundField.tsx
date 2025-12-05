import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import { useFormContext } from '../FormContext';

interface NotFoundFieldProps {
  compositeKey: string;
}

/**
 * Fallback field component shown when a field type is not found in the registry.
 * This helps identify configuration errors during development.
 */
function NotFoundField({ compositeKey }: NotFoundFieldProps) {
  const form = useFormContext();
  const fieldConfig = form.getFieldConfig(compositeKey);

  return (
    <Alert severity="warning" sx={{ my: 1 }}>
      <AlertTitle>Unknown Field Type</AlertTitle>
      <Typography variant="body2">
        Field type <strong>&quot;{fieldConfig?.type || 'undefined'}&quot;</strong> is not
        registered.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Key: {compositeKey}
      </Typography>
      {process.env.NODE_ENV === 'development' && fieldConfig && (
        <Typography
          variant="caption"
          component="pre"
          sx={{
            mt: 1,
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 200,
          }}
        >
          {JSON.stringify(fieldConfig, null, 2)}
        </Typography>
      )}
    </Alert>
  );
}

export default NotFoundField;
