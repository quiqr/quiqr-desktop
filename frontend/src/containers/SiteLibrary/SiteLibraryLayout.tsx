import { ReactNode } from 'react';
import { AppLayout } from '../../layouts/AppLayout';
import { SiteLibrarySidebar } from './SiteLibrarySidebar';
import { useSiteLibraryToolbarItems } from './SiteLibraryToolbarRight';

interface SiteLibraryLayoutProps {
  libraryView: string;
  onLibraryViewChange: (view: string) => void;
  onDialogOpen: (type: string) => void;
  children: ReactNode;
}

function SiteLibraryLayout({
  libraryView,
  onLibraryViewChange,
  onDialogOpen,
  children,
}: SiteLibraryLayoutProps) {
  const toolbarItems = useSiteLibraryToolbarItems({
    handleLibraryDialogClick: onDialogOpen,
    activeLibraryView: libraryView,
    handleChange: onLibraryViewChange,
  });

  return (
    <AppLayout
      title="Site Library"
      sidebar={<SiteLibrarySidebar />}
      toolbar={{
        leftItems: toolbarItems.leftItems,
        centerItems: toolbarItems.centerItems,
        rightItems: toolbarItems.rightItems,
      }}
    >
      {children}
    </AppLayout>
  );
}

export default SiteLibraryLayout;
