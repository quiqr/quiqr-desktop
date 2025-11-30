import { Routes, Route, useParams } from "react-router";
import SiteLibraryContent from "./SiteLibraryContent";

interface SiteLibraryRoutedProps {
  newSite?: boolean;
  importSite?: boolean;
  importSiteURL?: string;
  activeLibraryView?: string;
  handleLibraryDialogCloseClick: () => void;
}

// Wrapper for import-site-url/:url route
const ImportSiteUrlRoute = (props: Omit<SiteLibraryRoutedProps, 'handleLibraryDialogCloseClick'> & { handleLibraryDialogCloseClick: () => void }) => {
  const { url } = useParams();
  return (
    <SiteLibraryContent
      source={decodeURIComponent(url || '')}
      sourceArgument={null}
      {...props}
    />
  );
};

// Wrapper for import-site/:refresh route
const ImportSiteRefreshRoute = (props: Omit<SiteLibraryRoutedProps, 'handleLibraryDialogCloseClick'> & { handleLibraryDialogCloseClick: () => void }) => {
  const { refresh } = useParams();
  return (
    <SiteLibraryContent
      source={decodeURIComponent(refresh || '')}
      sourceArgument={null}
      {...props}
    />
  );
};

// Wrapper for /sites/:source route
const SiteSourceRoute = (props: Omit<SiteLibraryRoutedProps, 'handleLibraryDialogCloseClick'> & { handleLibraryDialogCloseClick: () => void }) => {
  const { source } = useParams();
  return (
    <SiteLibraryContent
      source={decodeURIComponent(source || 'last')}
      sourceArgument={null}
      {...props}
    />
  );
};

// Wrapper for /sites/:source/:args route
const SiteSourceArgsRoute = (props: Omit<SiteLibraryRoutedProps, 'handleLibraryDialogCloseClick'> & { handleLibraryDialogCloseClick: () => void }) => {
  const { source, args } = useParams();
  return (
    <SiteLibraryContent
      source={decodeURIComponent(source || 'last')}
      sourceArgument={decodeURIComponent(args || '')}
      {...props}
    />
  );
};

const SiteLibraryRouted = ({ newSite, importSite, importSiteURL, activeLibraryView, handleLibraryDialogCloseClick }: SiteLibraryRoutedProps) => {
  const commonProps = { newSite, importSite, importSiteURL, activeLibraryView, handleLibraryDialogCloseClick };

  return (
    <Routes>
      <Route path="import-site-url/:url" element={<ImportSiteUrlRoute {...commonProps} />} />
      <Route path="import-site/:refresh" element={<ImportSiteRefreshRoute {...commonProps} />} />
      <Route path=":source/:args" element={<SiteSourceArgsRoute {...commonProps} />} />
      <Route path=":source" element={<SiteSourceRoute {...commonProps} />} />
      <Route path="*" element={<SiteLibraryContent source="last" sourceArgument={null} {...commonProps} />} />
    </Routes>
  );
};

export default SiteLibraryRouted;
