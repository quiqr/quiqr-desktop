import DefaultWrapper from '../components/shared/DefaultWrapper';
import Chips from '../../Chips';
import Tip from '../../Tip';
import { useField } from '../useField';
import type { ChipsField as ChipsFieldConfig } from '@quiqr/types';

interface Props {
  compositeKey: string;
}

/**
 * ChipsField - tag/chip input field.
 * Supports adding, removing, and reordering chips.
 */
function ChipsField({ compositeKey }: Props) {
  const { field, value, setValue } = useField<string[]>(compositeKey);
  const config = field as ChipsFieldConfig;

  const items = value ?? config.default ?? [];

  const handlePushItem = (val: string) => {
    setValue([...items, val]);
  };

  const handleSwap = (_e: Event, { index, otherIndex }: { index: number; otherIndex: number }) => {
    const newItems = [...items];
    const temp = newItems[otherIndex];
    newItems[otherIndex] = newItems[index];
    newItems[index] = temp;
    setValue(newItems);
  };

  const handleRequestDelete = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setValue(newItems);
  };

  const iconButtons: React.ReactNode[] = [];
  if (config.tip) {
    iconButtons.push(<Tip key="tip" markdown={config.tip} />);
  }

  return (
    <DefaultWrapper>
      <Chips
        items={items}
        sortable={true}
        fullWidth={true}
        field={config}
        onRequestDelete={handleRequestDelete}
        onPushItem={handlePushItem}
        onSwap={handleSwap}
      />
    </DefaultWrapper>
  );
}

export default ChipsField;
