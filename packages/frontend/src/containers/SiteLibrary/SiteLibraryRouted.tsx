import { Routes, Route, useParams } from "react-router";
import SiteLibraryContent from "./SiteLibraryContent";

interface SiteLibraryRoutedProps {
  activeLibraryView?: string;
}

// Wrapper for import-site-url/:url route
const ImportSiteUrlRoute = (props: SiteLibraryRoutedProps) => {
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
const ImportSiteRefreshRoute = (props: SiteLibraryRoutedProps) => {
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
const SiteSourceRoute = (props: SiteLibraryRoutedProps) => {
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
const SiteSourceArgsRoute = (props: SiteLibraryRoutedProps) => {
  const { source, args } = useParams();
  return (
    <SiteLibraryContent
      source={decodeURIComponent(source || 'last')}
      sourceArgument={decodeURIComponent(args || '')}
      {...props}
    />
  );
};

const SiteLibraryRouted = ({ activeLibraryView }: SiteLibraryRoutedProps) => {
  const commonProps = { activeLibraryView };

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
