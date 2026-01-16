import { useMemo } from 'react';
import { useField } from '../useField';
import type { EmptyLineField as EmptyLineFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * EmptyLineField - renders visual spacing (line breaks).
 * The `amount` property controls how many <br/> elements to render.
 */
function EmptyLineField({ compositeKey }: Props) {
  const { field } = useField(compositeKey);
  const config = field as EmptyLineFieldConfig;

  const amount = config.amount ?? 1;

  const lines = useMemo(() => {
    return Array.from({ length: amount }, (_, idx) => <br key={idx} />);
  }, [amount]);

  return <div>{lines}</div>;
}

export default EmptyLineField;
