import { useNavigate } from "react-router";
import { TopToolbarRight, ToolbarButton, ToolbarToggleButtonGroup } from "../TopToolbarRight";
import AppsIcon from "@mui/icons-material/Apps";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import InputIcon from "@mui/icons-material/Input";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

interface SiteLibraryToolbarItemsProps {
  handleLibraryDialogClick: (dialogName: string) => void;
  activeLibraryView: string;
  handleChange: (viewName: string) => void;
}

/**
 * Hook that returns the toolbar button arrays for the Site Library view.
 * Use this with the new AppLayout toolbar prop.
 */
export const useSiteLibraryToolbarItems = ({
  handleLibraryDialogClick,
  activeLibraryView,
  handleChange,
}: SiteLibraryToolbarItemsProps) => {
  const navigate = useNavigate();

  const leftItems = [
    <ToolbarButton
      key='buttonNewSite'
      action={() => handleLibraryDialogClick("newSiteDialog")}
      title='New'
      icon={AddIcon}
    />,
    <ToolbarButton
      key='buttonImportSite'
      action={() => handleLibraryDialogClick("importSiteDialog")}
      title='Import'
      icon={InputIcon}
    />,
  ];

  const centerItems = [
    <ToolbarToggleButtonGroup
      key='buttonViewGroup'
      activeOption={activeLibraryView}
      handleChange={handleChange}
      optionItems={[
        {
          icon: <ViewListIcon />,
          value: "list",
        },
        {
          icon: <ViewModuleIcon />,
          value: "cards",
        },
      ]}
    />,
  ];

  const rightItems = [
    <ToolbarButton
      key={"toolbarbutton-library"}
      active={true}
      action={() => navigate("/sites/last")}
      title='Site Library'
      icon={AppsIcon}
    />,
    <ToolbarButton
      key='buttonPrefs'
      action={() => navigate("/prefs/")}
      title='Preferences'
      icon={SettingsApplicationsIcon}
    />,
  ];

  return { leftItems, centerItems, rightItems };
};

interface SiteLibraryToolbarRightProps {
  handleLibraryDialogClick: (dialogName: string) => void;
  activeLibraryView: string;
  handleChange: (viewName: string) => void;
}

/**
 * @deprecated Use useSiteLibraryToolbarItems hook with the new AppLayout instead
 */
export const SiteLibraryToolbarRight = ({
  handleLibraryDialogClick,
  activeLibraryView,
  handleChange,
}: SiteLibraryToolbarRightProps) => {
  const { leftItems, centerItems, rightItems } = useSiteLibraryToolbarItems({
    handleLibraryDialogClick,
    activeLibraryView,
    handleChange,
  });

  return (
    <TopToolbarRight
      key='toolbar-right-new-site'
      itemsLeft={leftItems}
      itemsCenter={centerItems}
      itemsRight={rightItems}
    />
  );
};
