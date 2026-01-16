import { AppLayout } from '../../layouts/AppLayout';
import { PrefsSidebar } from './PrefsSidebar';
import { PrefsRouted } from './PrefsRouted';
import usePrefsToolbarItems from './hooks/usePrefsToolbarItems';

function PrefsLayout() {
  const toolbarItems = usePrefsToolbarItems();

  return (
    <AppLayout
      title="Preferences"
      sidebar={<PrefsSidebar menus={[]} />}
      toolbar={{
        leftItems: toolbarItems.leftItems,
        rightItems: toolbarItems.rightItems,
      }}
    >
      <PrefsRouted />
    </AppLayout>
  );
}

export default PrefsLayout;
