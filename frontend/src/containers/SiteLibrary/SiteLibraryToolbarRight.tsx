import * as React from "react";
import { Route } from "react-router-dom";
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

export class SiteLibraryToolbarRight extends React.Component<SiteLibraryToolbarRightProps> {
  renderWithRoute(history: any) {
    const leftButtons = [
      <ToolbarButton
        key='buttonNewSite'
        action={() => {
          this.props.handleLibraryDialogClick("newSiteDialog");
        }}
        title='New'
        icon={AddIcon}
      />,

      <ToolbarButton
        key='buttonImportSite'
        action={() => {
          this.props.handleLibraryDialogClick("importSiteDialog");
        }}
        title='Import'
        icon={InputIcon}
      />,
    ];
    const centerButtons = [
      <ToolbarToggleButtonGroup
        key='buttonViewGroup'
        activeOption={this.props.activeLibraryView}
        handleChange={this.props.handleChange}
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
        action={() => {
          history.push("/sites/last");
        }}
        title='Site Library'
        icon={AppsIcon}
      />,
      <ToolbarButton
        key='buttonPrefs'
        action={() => {
          history.push("/prefs/");
        }}
        title='Preferences'
        icon={SettingsApplicationsIcon}
      />,
    ];

    return <TopToolbarRight key='toolbar-right-new-site' itemsLeft={leftButtons} itemsCenter={centerButtons} itemsRight={rightButtons} />;
  }

  render() {
    return (
      <Route
        render={({ history }) => {
          return this.renderWithRoute(history);
        }}
      />
    );
  }
}
