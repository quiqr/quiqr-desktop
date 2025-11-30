import { useNavigate } from "react-router-dom";
import { TopToolbarRight, ToolbarButton, ToolbarToggleButtonGroup } from "../TopToolbarRight";
import AppsIcon from "@mui/icons-material/Apps";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import InputIcon from "@mui/icons-material/Input";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

interface SiteLibraryToolbarRightProps {
  handleLibraryDialogClick: (dialogName: string) => void;
  activeLibraryView: string;
  handleChange: (viewName: string) => void;
}

export const SiteLibraryToolbarRight = ({
  handleLibraryDialogClick,
  activeLibraryView,
  handleChange,
}: SiteLibraryToolbarRightProps) => {
  const navigate = useNavigate();

  const leftButtons = [
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

  const centerButtons = [
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

  const rightButtons = [
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

  return (
    <TopToolbarRight
      key='toolbar-right-new-site'
      itemsLeft={leftButtons}
      itemsCenter={centerButtons}
      itemsRight={rightButtons}
    />
  );
};
