import React            from 'react';
import List             from '@mui/material/List';
import ListItem         from '@mui/material/ListItem';
import ListItemIcon     from '@mui/material/ListItemIcon';
import ListItemText     from '@mui/material/ListItemText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon       from '@mui/icons-material/Folder';
import { BaseDynamic }  from '../../HoForm';

class NestDynamic extends BaseDynamic {
  constructor(props){
    super(props);
    this.state = {
      childLabels: ''
    };
  }

  allocateStateLevel(field, parentState, rootState){
    if(field.groupdata==null||field.groupdata===true){
      if(parentState[field.key]===undefined)
        parentState[field.key]={};
      return parentState[field.key];
    }
    return parentState;
  }

  normalizeState({state, field, stateBuilder}){
    stateBuilder.setLevelState(state, field.fields);
  }

  extendField(field, fieldExtender){
    fieldExtender.extendFields(field.fields);
  }

  getType(){
    return 'nest';
  }

  buildBreadcrumbFragment(node, buttons){
    buttons.push({label: node.field.title, node});
  }

  buildPathFragment(node : any){
    return node.field.key;
  }

  componentDidMount(){
    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;
    if(currentPath===parentPath){
      let childLabels = field.fields.map((x) => {
        return x.title || x.key
      }).join(', ');
      this.setState({childLabels: `(${childLabels})` })
    }
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, nodePath, parentPath} = context;
    let {field} = node;

    if(currentPath===parentPath){
      return (
        <List style={{marginBottom:16, padding: 0}}>

          <ListItem
            style={{ padding: '20px 16px', border: 'solid 1px #d8d8d8', borderRadius:'7px'}}
            role={undefined}  button="true"
            onClick={function(){ context.setPath(node) } }
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>

            <ListItemText
              id={field.title}
              primary={`${field.title}`}
              secondary={this.state.childLabels}
            />
            <ChevronRightIcon />
          </ListItem>

        </List>
      );
    }

    if(currentPath.startsWith(nodePath)){
      var state = node.state;
      return context.renderLevel({ field, state, parent: node });
    }

    return (null);
  }
}

export default NestDynamic;
