import { lazy, Suspense, useMemo, ComponentType } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getFieldComponent, FieldComponentProps } from './FieldRegistry';
import { useFormContext } from './FormContext';

function FieldErrorFallback({
  error,
  resetErrorBoundary,
  compositeKey,
  fieldType,
}: FallbackProps & { compositeKey: string; fieldType: string }) {
  
  return (
    <Alert
      severity="error"
      sx={{ my: 1 }}
      action={
        <Button color="inherit" size="small" onClick={resetErrorBoundary}>
          Retry
        </Button>
      }
    >
      <AlertTitle>Field Error</AlertTitle>
      <Typography variant="body2" component="div">
        Failed to render field: <strong>{compositeKey}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Type: {fieldType}
      </Typography>
      {process.env.NODE_ENV === 'development' && (
        <Typography
          variant="caption"
          component="pre"
          sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {error instanceof Error ? error.message : String(error)}
        </Typography>
      )}
    </Alert>
  );
}

function FieldLoadingFallback() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, gap: 1 }}>
      <CircularProgress size={16} />
      <Typography variant="body2" color="text.secondary">
        Loading field...
      </Typography>
    </Box>
  );
}

const componentCache = new Map<string, ComponentType<FieldComponentProps>>();

function getLazyComponent(fieldType: string): ComponentType<FieldComponentProps> {
  if (!componentCache.has(fieldType)) {
    const importer = getFieldComponent(fieldType);
    const LazyComponent = lazy(importer);
    componentCache.set(fieldType, LazyComponent);
  }
  return componentCache.get(fieldType)!;
}

interface FieldRendererProps {
  compositeKey: string;
  loadingFallback?: React.ReactNode;
}

export function FieldRenderer({ compositeKey, loadingFallback }: FieldRendererProps) {
  const form = useFormContext();
  const fieldConfig = form.getFieldConfig(compositeKey);
  const fieldType = fieldConfig?.type || 'not-found';
  const FieldComponent = useMemo(() => getLazyComponent(fieldType), [fieldType]);

  return (
    <ErrorBoundary
      fallbackRender={(props) => (
        <FieldErrorFallback {...props} compositeKey={compositeKey} fieldType={fieldType} />
      )}
      resetKeys={[`${compositeKey}-${fieldType}`]}
    >
      <Suspense fallback={loadingFallback || <FieldLoadingFallback />}>
        <FieldComponent compositeKey={compositeKey} />
      </Suspense>
    </ErrorBoundary>
  );
}

interface FieldListProps {
  compositeKeys: string[];
  wrapper?: ComponentType<{ children: React.ReactNode }>;
}

export function FieldList({ compositeKeys, wrapper: Wrapper }: FieldListProps) {
  if (Wrapper) {
    return (
      <>
        {compositeKeys.map((key) => (
          <Wrapper key={key}>
            <FieldRenderer compositeKey={key} />
          </Wrapper>
        ))}
      </>
    );
  }

  return (
    <>
      {compositeKeys.map((key) => (
        <FieldRenderer key={key} compositeKey={key} />
      ))}
    </>
  );
}

export function clearFieldComponentCache(): void {
  componentCache.clear();
}

export default FieldRenderer;
