import * as React                                                 from 'react';
import service                                                    from './../../services/service';
import {TopToolbarRight, ToolbarButton, ToolbarToggleButtonGroup} from '../TopToolbarRight'
import SettingsApplicationsIcon                                   from '@material-ui/icons/SettingsApplications';
import InputIcon                                                  from '@material-ui/icons/Input';
import ViewListIcon                                               from '@material-ui/icons/ViewList';
import ViewModuleIcon                                             from '@material-ui/icons/ViewModule';

const iconColor = "#000";

export class SiteLibraryToolbarRight extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){

    const leftButtons = [
      <ToolbarButton
        action={()=>{
          service.api.redirectTo(`/sites/import-site`);
        }}
        title="Import"
        icon={<InputIcon style={{ color: iconColor }} />}
      />,

    ]
    const centerButtons = [
      <ToolbarToggleButtonGroup

        activeOption={this.props.activeLibraryView}
        handleChange={this.props.handleChange}
        optionItems={[
          {
            icon: <ViewListIcon />,
            value:"list"
          },
          {
            icon: <ViewModuleIcon />,
            value:"cards"
          }
        ]}

      />
    ]

    const rightButtons = [
      <ToolbarButton
        action={()=>{
          service.api.redirectTo(`/prefs/`);
        }}
        title="Preferences"
        icon={<SettingsApplicationsIcon style={{ color: iconColor }} />}
      />,
    ];

    return <TopToolbarRight
      itemsLeft={leftButtons}
      itemsCenter={centerButtons}
      itemsRight={rightButtons}
    />


  }
}
